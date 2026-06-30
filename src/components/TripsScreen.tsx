import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
};

type TripsScreenProps = {
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onTripProvinceSaved: (provinceId: string) => void;
};

type DateField = 'start' | 'end';

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

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function formatDate(isoDate: string) {
  if (!isoDate) {
    return '';
  }

  const date = fromIsoDate(isoDate);
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatLongDate(isoDate: string) {
  if (!isoDate) {
    return 'Seleccionar fecha';
  }

  const date = fromIsoDate(isoDate);
  const day = date.getDate();
  const month = monthNames[date.getMonth()].toLowerCase();
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function getTodayIsoDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getProvinceName(provinceId: string) {
  return provinces.find((province) => province.id === provinceId)?.name ?? '';
}

function getIsoDate(year: number, month: number, day: number) {
  const monthText = `${month + 1}`.padStart(2, '0');
  const dayText = `${day}`.padStart(2, '0');

  return `${year}-${monthText}-${dayText}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekdayOffset(year: number, month: number) {
  const jsDay = new Date(year, month, 1).getDay();

  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function TripsScreen({
  trips,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  onTripProvinceSaved,
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
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [selectedDateField, setSelectedDateField] =
    useState<DateField | null>(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function resetForm() {
    setEditingTrip(null);
    setName('');
    setProvinceId(provinces[0]?.id ?? '');
    setStartDate(getTodayIsoDate());
    setEndDate(getTodayIsoDate());
    setNotes('');
    setImageUri(undefined);
    setErrorMessage('');
    setSelectedDateField(null);
    setIsProvincePickerVisible(false);
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
    setErrorMessage('');
    setSelectedDateField(null);
    setIsProvincePickerVisible(false);
    setIsFormVisible(true);
  }

  function closeForm() {
    setIsFormVisible(false);
    resetForm();
  }

  function openDatePicker(field: DateField) {
    const currentDate = fromIsoDate(field === 'start' ? startDate : endDate);

    setSelectedDateField(field);
    setCalendarYear(currentDate.getFullYear());
    setCalendarMonth(currentDate.getMonth());
  }

  function closeDatePicker() {
    setSelectedDateField(null);
  }

  function changeMonth(amount: number) {
    const nextDate = new Date(calendarYear, calendarMonth + amount, 1);

    setCalendarYear(nextDate.getFullYear());
    setCalendarMonth(nextDate.getMonth());
  }

  function changeYear(amount: number) {
    setCalendarYear((currentYear) => currentYear + amount);
  }

  function selectCalendarDay(day: number) {
    const selectedIsoDate = getIsoDate(calendarYear, calendarMonth, day);

    if (selectedDateField === 'start') {
      setStartDate(selectedIsoDate);

      if (fromIsoDate(selectedIsoDate) > fromIsoDate(endDate)) {
        setEndDate(selectedIsoDate);
      }
    }

    if (selectedDateField === 'end') {
      setEndDate(selectedIsoDate);

      if (fromIsoDate(selectedIsoDate) < fromIsoDate(startDate)) {
        setStartDate(selectedIsoDate);
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
        setErrorMessage('Necesitamos acceso a tus fotos para añadir una imagen.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch (error) {
      console.log('Error picking image:', error);
      setErrorMessage('No se pudo seleccionar la imagen.');
    } finally {
      setIsImageLoading(false);
    }
  }

  function saveTrip() {
    const cleanName = name.trim();
    const cleanNotes = notes.trim();

    setErrorMessage('');

    if (!cleanName) {
      setErrorMessage('Escribe un nombre para el viaje.');
      return;
    }

    if (!provinceId) {
      setErrorMessage('Selecciona una provincia.');
      return;
    }

    if (!startDate || !endDate) {
      setErrorMessage('Añade fecha de inicio y fecha de fin.');
      return;
    }

    const tripToSave: Trip = {
      id: editingTrip?.id ?? createId(),
      name: cleanName,
      provinceId,
      startDate,
      endDate,
      notes: cleanNotes,
      imageUri,
    };

    if (editingTrip) {
      onUpdateTrip(tripToSave);
    } else {
      onAddTrip(tripToSave);
    }

    onTripProvinceSaved(provinceId);
    closeForm();
  }

  function askDeleteTrip(trip: Trip) {
    setTripToDelete(trip);
  }

  function cancelDeleteTrip() {
    setTripToDelete(null);
  }

  function confirmDeleteTrip() {
    if (!tripToDelete) {
      return;
    }

    onDeleteTrip(tripToDelete.id);
    setTripToDelete(null);
  }

  const daysInSelectedMonth = getDaysInMonth(calendarYear, calendarMonth);
  const firstWeekdayOffset = getFirstWeekdayOffset(calendarYear, calendarMonth);
  const calendarDays = Array.from(
    { length: daysInSelectedMonth },
    (_, index) => index + 1
  );  return (
    <View style={styles.screen}>
      <Pressable style={styles.addButton} onPress={openNewTripForm}>
        <Text style={styles.addButtonText}>＋ Añadir viaje</Text>
      </Pressable>

      {trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>✈️</Text>
          <Text style={styles.emptyTitle}>Aún no tienes viajes</Text>
          <Text style={styles.emptyText}>
            Guarda tus escapadas por España con fechas, provincia, notas y foto.
          </Text>
        </View>
      ) : (
        <View style={styles.tripsList}>
          {trips.map((trip) => (
            <View key={trip.id} style={styles.tripCard}>
              {trip.imageUri ? (
                <Image
                  source={{ uri: trip.imageUri }}
                  style={styles.tripImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.tripImagePlaceholder}>
                  <Text style={styles.tripImagePlaceholderText}>✈️</Text>
                </View>
              )}

              <View style={styles.tripContent}>
                <Text style={styles.tripName}>{trip.name}</Text>

                <Text style={styles.tripProvince}>
                  {getProvinceName(trip.provinceId)}
                </Text>

                <Text style={styles.tripDates}>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </Text>

                {trip.notes ? (
                  <Text style={styles.tripNotes} numberOfLines={3}>
                    {trip.notes}
                  </Text>
                ) : null}

                <View style={styles.tripActions}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() => openEditTripForm(trip)}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => askDeleteTrip(trip)}
                  >
                    <Text style={styles.deleteButtonText}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formHeader}>
                <View style={styles.formHeaderTextBlock}>
                  <Text style={styles.formTitle}>
                    {editingTrip ? 'Editar viaje' : 'Nuevo viaje'}
                  </Text>

                  <Text style={styles.formSubtitle}>
                    Guarda los detalles de tu escapada.
                  </Text>
                </View>

                <Pressable style={styles.closeButton} onPress={closeForm}>
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Nombre del viaje</Text>

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Ej: Fin de semana en Asturias"
                  placeholderTextColor={appColors.textMuted}
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Provincia</Text>

                <Pressable
                  style={styles.provinceSelectButton}
                  onPress={() => setIsProvincePickerVisible(true)}
                >
                  <Text style={styles.provinceSelectText}>
                    {getProvinceName(provinceId) || 'Seleccionar provincia'}
                  </Text>

                  <Text style={styles.provinceSelectAction}>Cambiar</Text>
                </Pressable>
              </View>

              <View style={styles.datesRow}>
                <View style={[styles.inputBlock, styles.dateInputBlock]}>
                  <Text style={styles.inputLabel}>Inicio</Text>

                  <Pressable
                    style={styles.dateButton}
                    onPress={() => openDatePicker('start')}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatLongDate(startDate)}
                    </Text>
                    <Text style={styles.dateButtonIcon}>📅</Text>
                  </Pressable>
                </View>

                <View style={[styles.inputBlock, styles.dateInputBlock]}>
                  <Text style={styles.inputLabel}>Fin</Text>

                  <Pressable
                    style={styles.dateButton}
                    onPress={() => openDatePicker('end')}
                  >
                    <Text style={styles.dateButtonText}>
                      {formatLongDate(endDate)}
                    </Text>
                    <Text style={styles.dateButtonIcon}>📅</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Notas</Text>

                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Qué hiciste, lugares que viste, recuerdos..."
                  placeholderTextColor={appColors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable style={styles.imageButton} onPress={pickImage}>
                {isImageLoading ? (
                  <ActivityIndicator color={appColors.black} />
                ) : (
                  <Text style={styles.imageButtonText}>
                    {imageUri ? 'Cambiar foto' : 'Añadir foto'}
                  </Text>
                )}
              </Pressable>

              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.formImagePreview}
                  resizeMode="cover"
                />
              ) : null}

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <Pressable style={styles.saveButton} onPress={saveTrip}>
                <Text style={styles.saveButtonText}>
                  {editingTrip ? 'Guardar cambios' : 'Guardar viaje'}
                </Text>
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
        <View style={styles.provincePickerOverlay}>
          <View style={styles.provincePickerCard}>
            <View style={styles.provincePickerHeader}>
              <View>
                <Text style={styles.provincePickerTitle}>Elegir provincia</Text>
                <Text style={styles.provincePickerSubtitle}>
                  Selecciona la provincia del viaje
                </Text>
              </View>

              <Pressable
                style={styles.provincePickerCloseButton}
                onPress={() => setIsProvincePickerVisible(false)}
              >
                <Text style={styles.provincePickerCloseButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.provincePickerList}>
                {provinces.map((province) => {
                  const isSelected = province.id === provinceId;

                  return (
                    <Pressable
                      key={province.id}
                      style={[
                        styles.provincePickerItem,
                        isSelected && styles.provincePickerItemSelected,
                      ]}
                      onPress={() => {
                        setProvinceId(province.id);
                        setIsProvincePickerVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.provincePickerItemText,
                          isSelected &&
                            styles.provincePickerItemTextSelected,
                        ]}
                      >
                        {province.name}
                      </Text>

                      {isSelected ? (
                        <Text style={styles.provincePickerCheck}>✓</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedDateField}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View>
                <Text style={styles.calendarTitle}>
                  {selectedDateField === 'start'
                    ? 'Fecha de inicio'
                    : 'Fecha de fin'}
                </Text>
                <Text style={styles.calendarSubtitle}>
                  Selecciona día, mes y año
                </Text>
              </View>

              <Pressable
                style={styles.calendarCloseButton}
                onPress={closeDatePicker}
              >
                <Text style={styles.calendarCloseButtonText}>×</Text>
              </Pressable>
            </View>

            <View style={styles.calendarControls}>
              <View style={styles.calendarControlRow}>
                <Pressable
                  style={styles.calendarControlButton}
                  onPress={() => changeYear(-1)}
                >
                  <Text style={styles.calendarControlText}>Año -</Text>
                </Pressable>

                <Text style={styles.calendarYearText}>{calendarYear}</Text>

                <Pressable
                  style={styles.calendarControlButton}
                  onPress={() => changeYear(1)}
                >
                  <Text style={styles.calendarControlText}>Año +</Text>
                </Pressable>
              </View>

              <View style={styles.calendarControlRow}>
                <Pressable
                  style={styles.calendarControlButton}
                  onPress={() => changeMonth(-1)}
                >
                  <Text style={styles.calendarControlText}>‹ Mes</Text>
                </Pressable>

                <Text style={styles.calendarMonthText}>
                  {monthNames[calendarMonth]}
                </Text>

                <Pressable
                  style={styles.calendarControlButton}
                  onPress={() => changeMonth(1)}
                >
                  <Text style={styles.calendarControlText}>Mes ›</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.weekDaysGrid}>
              {weekDays.map((day) => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: firstWeekdayOffset }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptyDayCell} />
              ))}

              {calendarDays.map((day) => {
                const isoDate = getIsoDate(calendarYear, calendarMonth, day);
                const isSelected =
                  isoDate ===
                  (selectedDateField === 'start' ? startDate : endDate);

                return (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => selectCalendarDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isSelected && styles.dayCellTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!tripToDelete}
        transparent
        animationType="fade"
        onRequestClose={cancelDeleteTrip}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalCard}>
            <Text style={styles.deleteModalTitle}>Eliminar viaje</Text>

            <Text style={styles.deleteModalText}>
              ¿Seguro que quieres borrar “{tripToDelete?.name}”? Esta acción no
              se puede deshacer.
            </Text>

            <View style={styles.deleteModalActions}>
              <Pressable
                style={styles.cancelDeleteButton}
                onPress={cancelDeleteTrip}
              >
                <Text style={styles.cancelDeleteButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.confirmDeleteButton}
                onPress={confirmDeleteTrip}
              >
                <Text style={styles.confirmDeleteButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}const styles = StyleSheet.create({
  screen: {
    width: '100%',
    gap: 14,
  },
  addButton: {
    backgroundColor: appColors.white,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  emptyCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: appColors.text,
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  emptyText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  tripsList: {
    gap: 14,
  },
  tripCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  tripImage: {
    width: '100%',
    height: 190,
    backgroundColor: appColors.surfaceSoft,
  },
  tripImagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: appColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripImagePlaceholderText: {
    fontSize: 42,
  },
  tripContent: {
    padding: 16,
  },
  tripName: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  tripProvince: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  tripDates: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    fontFamily: appFonts.main,
  },
  tripNotes: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
    fontFamily: appFonts.main,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: appColors.white,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: appColors.home,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '90%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 18,
  },
  formHeaderTextBlock: {
    flex: 1,
  },
  formTitle: {
    color: appColors.text,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
    fontFamily: appFonts.main,
  },
  formSubtitle: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
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
    fontWeight: '700',
    lineHeight: 25,
    fontFamily: appFonts.main,
  },
  inputBlock: {
    marginBottom: 14,
  },
  inputLabel: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: appColors.text,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: appFonts.main,
  },
  notesInput: {
    minHeight: 100,
    lineHeight: 22,
  },
  provinceSelectButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  provinceSelectText: {
    flex: 1,
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provinceSelectAction: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provincePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  provincePickerCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '82%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
  },
  provincePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  provincePickerTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  provincePickerSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontFamily: appFonts.main,
  },
  provincePickerCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provincePickerCloseButtonText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 25,
    fontFamily: appFonts.main,
  },
  provincePickerList: {
    gap: 8,
    paddingBottom: 4,
  },
  provincePickerItem: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  provincePickerItemSelected: {
    backgroundColor: appColors.white,
    borderColor: appColors.white,
  },
  provincePickerItemText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provincePickerItemTextSelected: {
    color: appColors.black,
  },
  provincePickerCheck: {
    color: appColors.black,
    fontSize: 17,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputBlock: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 54,
    justifyContent: 'center',
  },
  dateButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  dateButtonIcon: {
    position: 'absolute',
    right: 12,
    top: 15,
    fontSize: 17,
  },
  imageButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  imageButtonText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  formImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    backgroundColor: appColors.surfaceSoft,
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: appColors.home,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  saveButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 4,
  },
  saveButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  calendarTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  calendarSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontFamily: appFonts.main,
  },
  calendarCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCloseButtonText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 25,
    fontFamily: appFonts.main,
  },
  calendarControls: {
    gap: 10,
    marginBottom: 16,
  },
  calendarControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calendarControlButton: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  calendarControlText: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarYearText: {
    minWidth: 72,
    textAlign: 'center',
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarMonthText: {
    minWidth: 96,
    textAlign: 'center',
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  weekDaysGrid: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  emptyDayCell: {
    width: `${100 / 7}%`,
    height: 40,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: appColors.white,
    borderRadius: 20,
  },
  dayCellText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  dayCellTextSelected: {
    color: appColors.black,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  deleteModalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: appColors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 20,
  },
  deleteModalTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  deleteModalText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    fontFamily: appFonts.main,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cancelDeleteButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: appColors.home,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});