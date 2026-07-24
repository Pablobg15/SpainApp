import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { provinces } from '../data/provinces';
import { appColors, appFonts } from '../theme';

export type Trip = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  provinceId: string;
  notes: string;
  imageUri?: string;
  isPublic?: boolean;
};

type TripsScreenProps = {
  trips: Trip[];
  onAddTrip?: (trip: Trip) => Promise<void> | void;
  onCreateTrip?: (trip: Trip) => Promise<void> | void;
  onUpdateTrip: (trip: Trip) => Promise<void> | void;
  onDeleteTrip: (tripId: string) => Promise<void> | void;
  onSelectTrip?: (trip: Trip) => void;
};

type DateField = 'start' | 'end';

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function getTodayIsoDate() {
  const today = new Date();

  return today.toISOString().split('T')[0];
}

function formatDate(date: string) {
  if (!date) {
    return 'Seleccionar fecha';
  }

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function formatDateRange(startDate: string, endDate: string) {
  if (startDate === endDate) {
    return formatDate(startDate);
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getProvinceName(provinceId: string) {
  return (
    provinces.find((province) => province.id === provinceId)?.name ??
    provinceId
  );
}

function getIsoDateFromParts(year: number, month: number, day: number) {
  const monthText = String(month + 1).padStart(2, '0');
  const dayText = String(day).padStart(2, '0');

  return `${year}-${monthText}-${dayText}`;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekDay = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const emptyDays = Array.from({ length: firstWeekDay }, (_, index) => ({
    id: `empty-${index}`,
    day: null as number | null,
  }));

  const monthDays = Array.from({ length: daysInMonth }, (_, index) => ({
    id: `day-${index + 1}`,
    day: index + 1,
  }));

  return [...emptyDays, ...monthDays];
}

export default function TripsScreen({
  trips,
  onAddTrip,
  onCreateTrip,
  onUpdateTrip,
  onDeleteTrip,
  onSelectTrip,
}: TripsScreenProps) {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);

  const [isProvincePickerVisible, setIsProvincePickerVisible] = useState(false);

  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState(provinces[0]?.id ?? '');
  const [startDate, setStartDate] = useState(getTodayIsoDate());
  const [endDate, setEndDate] = useState(getTodayIsoDate());
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [isPublic, setIsPublic] = useState(true);

  const [selectedDateField, setSelectedDateField] = useState<DateField | null>(
    null
  );
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isSavingTrip, setIsSavingTrip] = useState(false);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sortedTrips = useMemo(() => {
    return [...trips].sort((a, b) => {
      return b.startDate.localeCompare(a.startDate);
    });
  }, [trips]);

  const selectedProvinceName = getProvinceName(provinceId);

  function resetForm() {
    setEditingTrip(null);
    setName('');
    setProvinceId(provinces[0]?.id ?? '');
    setStartDate(getTodayIsoDate());
    setEndDate(getTodayIsoDate());
    setNotes('');
    setImageUri(undefined);
    setIsPublic(true);
    setErrorMessage('');
    setSelectedDateField(null);
  }

  function openNewTripForm() {
    resetForm();
    setIsFormVisible(true);
  }

  function openEditTripForm(trip: Trip) {
    setEditingTrip(trip);
    setName(trip.name);
    setProvinceId(trip.provinceId);
    setStartDate(trip.startDate);
    setEndDate(trip.endDate);
    setNotes(trip.notes);
    setImageUri(trip.imageUri);
    setIsPublic(trip.isPublic ?? true);
    setErrorMessage('');
    setIsFormVisible(true);
  }

  function closeForm() {
    if (isSavingTrip) {
      return;
    }

    setIsFormVisible(false);
    resetForm();
  }

  function openDatePicker(field: DateField) {
    const currentDate = field === 'start' ? startDate : endDate;
    const [year, month] = currentDate.split('-').map(Number);

    if (year && month) {
      setCalendarYear(year);
      setCalendarMonth(month - 1);
    }

    setSelectedDateField(field);
  }

  function closeDatePicker() {
    setSelectedDateField(null);
  }

  function changeMonth(direction: 'previous' | 'next') {
    setCalendarMonth((currentMonth) => {
      if (direction === 'previous') {
        if (currentMonth === 0) {
          setCalendarYear((currentYear) => currentYear - 1);
          return 11;
        }

        return currentMonth - 1;
      }

      if (currentMonth === 11) {
        setCalendarYear((currentYear) => currentYear + 1);
        return 0;
      }

      return currentMonth + 1;
    });
  }

  function changeYear(direction: 'previous' | 'next') {
    setCalendarYear((currentYear) =>
      direction === 'previous' ? currentYear - 1 : currentYear + 1
    );
  }

  function selectCalendarDay(day: number) {
    if (!selectedDateField) {
      return;
    }

    const selectedDate = getIsoDateFromParts(calendarYear, calendarMonth, day);

    if (selectedDateField === 'start') {
      setStartDate(selectedDate);

      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    } else {
      setEndDate(selectedDate);

      if (selectedDate < startDate) {
        setStartDate(selectedDate);
      }
    }

    closeDatePicker();
  }

  async function pickImage() {
    try {
      setIsImageLoading(true);

      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setErrorMessage('Necesitamos permiso para acceder a tus fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo seleccionar la imagen.';

      setErrorMessage(message);
    } finally {
      setIsImageLoading(false);
    }
  }

  async function saveTrip() {
    const cleanName = name.trim();
    const cleanNotes = notes.trim();

    setErrorMessage('');

    if (cleanName.length < 2) {
      setErrorMessage('Introduce un nombre para el viaje.');
      return;
    }

    if (!provinceId) {
      setErrorMessage('Selecciona una provincia.');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage('Selecciona la fecha de inicio y fin.');
      return;
    }

    if (endDate < startDate) {
      setErrorMessage('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    const tripToSave: Trip = {
      id: editingTrip?.id ?? `${Date.now()}`,
      name: cleanName,
      startDate,
      endDate,
      provinceId,
      notes: cleanNotes,
      imageUri,
      isPublic,
    };

    try {
      setIsSavingTrip(true);

      if (editingTrip) {
        await onUpdateTrip(tripToSave);
      } else if (onAddTrip) {
        await onAddTrip(tripToSave);
      } else if (onCreateTrip) {
        await onCreateTrip(tripToSave);
      }

      setIsFormVisible(false);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo guardar el viaje.';

      setErrorMessage(message);
    } finally {
      setIsSavingTrip(false);
    }
  }  
  
  function askDeleteTrip(trip: Trip) {
    setTripToDelete(trip);
  }

  function cancelDeleteTrip() {
    if (isDeletingTrip) {
      return;
    }

    setTripToDelete(null);
  }

  async function confirmDeleteTrip() {
    if (!tripToDelete) {
      return;
    }

    try {
      setIsDeletingTrip(true);

      await onDeleteTrip(tripToDelete.id);

      setTripToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el viaje.';

      setErrorMessage(message);
    } finally {
      setIsDeletingTrip(false);
    }
  }

  const calendarDays = getCalendarDays(calendarYear, calendarMonth);

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.eyebrow}>Diario de viaje</Text>

          <Text style={styles.title}>Mis viajes</Text>

          <Text style={styles.subtitle}>
            Guarda tus escapadas, fotos y notas de cada provincia.
          </Text>
        </View>

        <Pressable style={styles.addButton} onPress={openNewTripForm}>
          <Text style={styles.addButtonText}>+ Añadir</Text>
        </Pressable>
      </View>

      {sortedTrips.length > 0 ? (
        <View style={styles.tripsList}>
          {sortedTrips.map((trip) => (
            <Pressable
              key={trip.id}
              style={styles.tripCard}
              onPress={() => onSelectTrip?.(trip)}
            >
              {trip.imageUri ? (
                <Image source={{ uri: trip.imageUri }} style={styles.tripImage} />
              ) : (
                <View style={styles.tripImagePlaceholder}>
                  <Text style={styles.tripImagePlaceholderText}>✈️</Text>
                </View>
              )}

              <View style={styles.tripInfo}>
                <View style={styles.tripTopRow}>
                  <View style={styles.tripTitleBlock}>
                    <Text style={styles.tripName}>{trip.name}</Text>

                    <Text style={styles.tripProvince}>
                      {getProvinceName(trip.provinceId)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.visibilityBadge,
                      !(trip.isPublic ?? true) && styles.visibilityBadgePrivate,
                    ]}
                  >
                    <Text
                      style={[
                        styles.visibilityBadgeText,
                        !(trip.isPublic ?? true) &&
                          styles.visibilityBadgeTextPrivate,
                      ]}
                    >
                      {trip.isPublic ?? true ? 'Amigos' : 'Privado'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.tripDate}>
                  {formatDateRange(trip.startDate, trip.endDate)}
                </Text>

                {trip.notes ? (
                  <Text style={styles.tripNotes} numberOfLines={2}>
                    {trip.notes}
                  </Text>
                ) : null}

                <View style={styles.tripActions}>
                  <Pressable
                    style={styles.tripActionButton}
                    onPress={() => openEditTripForm(trip)}
                  >
                    <Text style={styles.tripActionButtonText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.tripActionButton, styles.tripDeleteButton]}
                    onPress={() => askDeleteTrip(trip)}
                  >
                    <Text
                      style={[
                        styles.tripActionButtonText,
                        styles.tripDeleteButtonText,
                      ]}
                    >
                      Eliminar
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🧳</Text>

          <Text style={styles.emptyTitle}>Todavía no tienes viajes</Text>

          <Text style={styles.emptyText}>
            Añade tu primer viaje para guardar fechas, provincia, notas y una
            foto.
          </Text>

          <Pressable style={styles.emptyButton} onPress={openNewTripForm}>
            <Text style={styles.emptyButtonText}>Crear mi primer viaje</Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={isFormVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderTextBlock}>
                <Text style={styles.formTitle}>
                  {editingTrip ? 'Editar viaje' : 'Nuevo viaje'}
                </Text>

                <Text style={styles.formSubtitle}>
                  Completa los datos de tu escapada.
                </Text>
              </View>

              <Pressable style={styles.closeButton} onPress={closeForm}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del viaje</Text>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Fin de semana en Asturias"
                  placeholderTextColor={appColors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provincia</Text>

                <Pressable
                  style={styles.selectorButton}
                  onPress={() => setIsProvincePickerVisible(true)}
                >
                  <Text style={styles.selectorButtonText}>
                    {selectedProvinceName}
                  </Text>

                  <Text style={styles.selectorButtonIcon}>⌄</Text>
                </Pressable>
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateColumn}>
                  <Text style={styles.label}>Inicio</Text>

                  <Pressable
                    style={styles.dateButton}
                    onPress={() => openDatePicker('start')}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatDate(startDate)}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.label}>Fin</Text>

                  <Pressable
                    style={styles.dateButton}
                    onPress={() => openDatePicker('end')}
                  >
                    <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas</Text>

                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Qué hiciste, sitios que visitaste, recuerdos..."
                  placeholderTextColor={appColors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.visibilityCard}>
                <View style={styles.visibilityTextBlock}>
                  <Text style={styles.visibilityTitle}>Visible para amigos</Text>

                  <Text style={styles.visibilityDescription}>
                    {isPublic
                      ? 'Tus amigos podrán ver este viaje en tu perfil.'
                      : 'Solo tú podrás ver este viaje.'}
                  </Text>
                </View>

                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{
                    false: appColors.border,
                    true: appColors.visited,
                  }}
                  thumbColor={appColors.white}
                />
              </View>

              <View style={styles.imagePickerBlock}>
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.formImage} />
                ) : (
                  <View style={styles.formImagePlaceholder}>
                    <Text style={styles.formImagePlaceholderText}>📷</Text>
                    <Text style={styles.formImagePlaceholderLabel}>
                      Sin foto todavía
                    </Text>
                  </View>
                )}

                <Pressable
                  style={[styles.secondaryButton, isImageLoading && styles.disabledButton]}
                  onPress={pickImage}
                  disabled={isImageLoading}
                >
                  {isImageLoading ? (
                    <ActivityIndicator color={appColors.text} />
                  ) : (
                    <Text style={styles.secondaryButtonText}>
                      {imageUri ? 'Cambiar foto' : 'Añadir foto'}
                    </Text>
                  )}
                </Pressable>
              </View>

              {errorMessage ? (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              ) : null}

              <Pressable
                style={[styles.saveButton, isSavingTrip && styles.disabledButton]}
                onPress={saveTrip}
                disabled={isSavingTrip}
              >
                {isSavingTrip ? (
                  <ActivityIndicator color={appColors.black} />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingTrip ? 'Guardar cambios' : 'Crear viaje'}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProvincePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProvincePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderTextBlock}>
                <Text style={styles.formTitle}>Selecciona provincia</Text>

                <Text style={styles.formSubtitle}>
                  Elige dónde fue este viaje.
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setIsProvincePickerVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.provincePickerList}
              showsVerticalScrollIndicator={false}
            >
              {provinces.map((province) => {
                const isSelected = province.id === provinceId;

                return (
                  <Pressable
                    key={province.id}
                    style={[
                      styles.provincePickerItem,
                      isSelected && styles.provincePickerItemActive,
                    ]}
                    onPress={() => {
                      setProvinceId(province.id);
                      setIsProvincePickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.provincePickerItemText,
                        isSelected && styles.provincePickerItemTextActive,
                      ]}
                    >
                      {province.name}
                    </Text>

                    <Text style={styles.provincePickerCommunity}>
                      {province.community}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>      
      <Modal
        visible={Boolean(selectedDateField)}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderTextBlock}>
                <Text style={styles.formTitle}>
                  {selectedDateField === 'start'
                    ? 'Fecha de inicio'
                    : 'Fecha de fin'}
                </Text>

                <Text style={styles.formSubtitle}>Selecciona una fecha.</Text>
              </View>

              <Pressable style={styles.closeButton} onPress={closeDatePicker}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.calendarControls}>
              <View style={styles.calendarYearRow}>
                <Pressable
                  style={styles.calendarControlButton}
                  onPress={() => changeYear('previous')}
                >
                  <Text style={styles.calendarControlText}>Año -</Text>
                </Pressable>

                <Text style={styles.calendarCurrentYear}>{calendarYear}</Text>

                <Pressable
                  style={styles.calendarControlButton}
                  onPress={() => changeYear('next')}
                >
                  <Text style={styles.calendarControlText}>Año +</Text>
                </Pressable>
              </View>

              <View style={styles.calendarMonthRow}>
                <Pressable
                  style={styles.calendarArrowButton}
                  onPress={() => changeMonth('previous')}
                >
                  <Text style={styles.calendarArrowText}>‹</Text>
                </Pressable>

                <Text style={styles.calendarCurrentMonth}>
                  {monthNames[calendarMonth]}
                </Text>

                <Pressable
                  style={styles.calendarArrowButton}
                  onPress={() => changeMonth('next')}
                >
                  <Text style={styles.calendarArrowText}>›</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.weekDaysRow}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((item) => {
                if (!item.day) {
                  return <View key={item.id} style={styles.calendarDayEmpty} />;
                }

                const isoDate = getIsoDateFromParts(
                  calendarYear,
                  calendarMonth,
                  item.day
                );

                const isSelected =
                  isoDate ===
                  (selectedDateField === 'start' ? startDate : endDate);

                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.calendarDayButton,
                      isSelected && styles.calendarDayButtonActive,
                    ]}
                    onPress={() => selectCalendarDay(item.day as number)}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextActive,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(tripToDelete)}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteTrip}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteCard}>
            <Text style={styles.deleteIcon}>🗑️</Text>

            <Text style={styles.deleteTitle}>Eliminar viaje</Text>

            <Text style={styles.deleteText}>
              ¿Seguro que quieres eliminar “{tripToDelete?.name}”? Esta acción
              no se puede deshacer.
            </Text>

            <View style={styles.deleteActions}>
              <Pressable
                style={styles.deleteCancelButton}
                onPress={cancelDeleteTrip}
                disabled={isDeletingTrip}
              >
                <Text style={styles.deleteCancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.deleteConfirmButton,
                  isDeletingTrip && styles.disabledButton,
                ]}
                onPress={confirmDeleteTrip}
                disabled={isDeletingTrip}
              >
                {isDeletingTrip ? (
                  <ActivityIndicator color={appColors.white} />
                ) : (
                  <Text style={styles.deleteConfirmButtonText}>Eliminar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  headerCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 28,
    padding: 20,
    gap: 16,
  },
  headerTextBlock: {
    gap: 6,
  },
  eyebrow: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: appFonts.main,
  },
  title: {
    color: appColors.text,
    fontSize: 32,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  subtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: appFonts.main,
  },
  addButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripsList: {
    gap: 14,
  },
  tripCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 26,
    overflow: 'hidden',
  },
  tripImage: {
    width: '100%',
    height: 190,
    backgroundColor: appColors.surfaceSoft,
  },
  tripImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: appColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripImagePlaceholderText: {
    fontSize: 44,
  },
  tripInfo: {
    padding: 16,
    gap: 8,
  },
  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  tripTitleBlock: {
    flex: 1,
  },
  tripName: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripProvince: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    fontFamily: appFonts.main,
  },
  visibilityBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.32)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  visibilityBadgePrivate: {
    backgroundColor: 'rgba(122, 122, 122, 0.18)',
    borderColor: 'rgba(122, 122, 122, 0.4)',
  },
  visibilityBadgeText: {
    color: '#86EFAC',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  visibilityBadgeTextPrivate: {
    color: appColors.textMuted,
  },
  tripDate: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  tripNotes: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tripActionButton: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 15,
    paddingVertical: 11,
    alignItems: 'center',
  },
  tripActionButtonText: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripDeleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.32)',
  },
  tripDeleteButtonText: {
    color: '#FCA5A5',
  },
  emptyCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  emptyText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  emptyButton: {
    backgroundColor: appColors.white,
    borderRadius: 17,
    paddingVertical: 13,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  emptyButtonText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  formCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  pickerCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  calendarCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: appColors.border,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  formHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  formHeaderTextBlock: {
    flex: 1,
  },
  formTitle: {
    color: appColors.text,
    fontSize: 25,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  formSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontFamily: appFonts.main,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 26,
  },
  formContent: {
    padding: 18,
    gap: 15,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: appColors.text,
    fontSize: 15,
    fontFamily: appFonts.main,
  },
  notesInput: {
    minHeight: 96,
  },
  selectorButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  selectorButtonIcon: {
    color: appColors.textMuted,
    fontSize: 18,
    fontWeight: '900',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateColumn: {
    flex: 1,
    gap: 8,
  },
  dateButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  dateButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  visibilityCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  visibilityTextBlock: {
    flex: 1,
  },
  visibilityTitle: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  visibilityDescription: {
    color: appColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    fontFamily: appFonts.main,
  },
  imagePickerBlock: {
    gap: 10,
  },
  formImage: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    backgroundColor: appColors.surfaceSoft,
  },
  formImagePlaceholder: {
    height: 150,
    borderRadius: 20,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  formImagePlaceholderText: {
    fontSize: 34,
  },
  formImagePlaceholderLabel: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  secondaryButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  saveButton: {
    backgroundColor: appColors.white,
    borderRadius: 17,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  disabledButton: {
    opacity: 0.65,
  },
  errorMessage: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  provincePickerList: {
    padding: 14,
    gap: 8,
  },
  provincePickerItem: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    padding: 14,
  },
  provincePickerItemActive: {
    backgroundColor: appColors.white,
  },
  provincePickerItemText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provincePickerItemTextActive: {
    color: appColors.black,
  },
  provincePickerCommunity: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    fontFamily: appFonts.main,
  },
  calendarControls: {
    padding: 16,
    gap: 12,
  },
  calendarYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarControlButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  calendarControlText: {
    color: appColors.text,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarCurrentYear: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarArrowButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarArrowText: {
    color: appColors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 30,
  },
  calendarCurrentMonth: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  weekDaysRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekDayText: {
    flex: 1,
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 6,
  },
  calendarDayEmpty: {
    width: '13.4%',
    aspectRatio: 1,
  },
  calendarDayButton: {
    width: '13.4%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayButtonActive: {
    backgroundColor: appColors.white,
  },
  calendarDayText: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarDayTextActive: {
    color: appColors.black,
  },
  deleteCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  deleteIcon: {
    fontSize: 44,
  },
  deleteTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  deleteText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  deleteCancelButton: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: 'center',
  },
  deleteCancelButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 17,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmButtonText: {
    color: appColors.white,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});