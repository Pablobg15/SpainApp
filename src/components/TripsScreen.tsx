import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
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

type CalendarTarget = 'start' | 'end' | null;

function getProvinceName(provinceId: string) {
  return provinces.find((province) => province.id === provinceId)?.name ?? '';
}

function createCalendarDate(year: number, month: number, day: number) {
  return new Date(year, month, day, 12, 0, 0);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function fromIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);

  return createCalendarDate(year, month - 1, day);
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

function getMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = createCalendarDate(year, month, 1);
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = createCalendarDate(year, month + 1, 0).getDate();

  const days: Array<Date | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(createCalendarDate(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function TripsScreen({
  trips,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  onTripProvinceSaved,
}: TripsScreenProps) {
  const [isAddTripOpen, setIsAddTripOpen] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  const [tripName, setTripName] = useState('');
  const [tripStartDate, setTripStartDate] = useState('');
  const [tripEndDate, setTripEndDate] = useState('');
  const [tripNotes, setTripNotes] = useState('');
  const [tripImageUri, setTripImageUri] = useState('');

  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [isProvinceSelectorOpen, setIsProvinceSelectorOpen] = useState(false);

  const [calendarTarget, setCalendarTarget] = useState<CalendarTarget>(null);
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const filteredProvinces = useMemo(() => {
    const normalizedSearch = provinceSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return provinces;
    }

    return provinces.filter(
      (province) =>
        province.name.toLowerCase().includes(normalizedSearch) ||
        province.community.toLowerCase().includes(normalizedSearch)
    );
  }, [provinceSearch]);

  function resetForm() {
    setTripName('');
    setTripStartDate('');
    setTripEndDate('');
    setTripNotes('');
    setTripImageUri('');
    setSelectedProvinceId('');
    setProvinceSearch('');
    setIsProvinceSelectorOpen(false);
    setCalendarTarget(null);
    setVisibleMonth(new Date());
    setEditingTripId(null);
  }

  function closePopup() {
    setIsAddTripOpen(false);
    resetForm();
  }

  function openCreateTrip() {
    resetForm();
    setIsAddTripOpen(true);
  }

  function openEditTrip(trip: Trip) {
    setEditingTripId(trip.id);
    setTripName(trip.name);
    setTripStartDate(trip.startDate);
    setTripEndDate(trip.endDate);
    setTripNotes(trip.notes);
    setTripImageUri(trip.imageUri ?? '');
    setSelectedProvinceId(trip.provinceId);
    setProvinceSearch('');
    setIsProvinceSelectorOpen(false);
    setCalendarTarget(null);
    setVisibleMonth(fromIsoDate(trip.startDate));
    setIsAddTripOpen(true);
  }

  function openCalendar(target: CalendarTarget) {
    setCalendarTarget(target);
    setIsProvinceSelectorOpen(false);

    const selectedDate =
      target === 'start'
        ? tripStartDate
        : target === 'end'
          ? tripEndDate
          : '';

    if (selectedDate) {
      setVisibleMonth(fromIsoDate(selectedDate));
    } else if (target === 'end' && tripStartDate) {
      setVisibleMonth(fromIsoDate(tripStartDate));
    } else {
      setVisibleMonth(new Date());
    }
  }

  function selectCalendarDate(isoDate: string) {
    if (calendarTarget === 'start') {
      setTripStartDate(isoDate);

      if (tripEndDate && tripEndDate < isoDate) {
        setTripEndDate('');
      }

      setCalendarTarget(null);
      return;
    }

    if (calendarTarget === 'end') {
      if (tripStartDate && isoDate < tripStartDate) {
        return;
      }

      setTripEndDate(isoDate);
      setCalendarTarget(null);
    }
  }

  function goToPreviousMonth() {
    setVisibleMonth(
      (currentMonth) =>
        createCalendarDate(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          1
        )
    );
  }

  function goToNextMonth() {
    setVisibleMonth(
      (currentMonth) =>
        createCalendarDate(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          1
        )
    );
  }

  async function pickTripImage() {
    setCalendarTarget(null);
    setIsProvinceSelectorOpen(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setTripImageUri(result.assets[0].uri);
    }
  }

  function saveTrip() {
    if (
      !tripName.trim() ||
      !tripStartDate ||
      !tripEndDate ||
      !selectedProvinceId ||
      tripEndDate < tripStartDate
    ) {
      return;
    }

    const tripToSave: Trip = {
      id: editingTripId ?? `${Date.now()}`,
      name: tripName.trim(),
      startDate: tripStartDate,
      endDate: tripEndDate,
      provinceId: selectedProvinceId,
      notes: tripNotes.trim(),
      imageUri: tripImageUri,
    };

    if (editingTripId) {
      onUpdateTrip(tripToSave);
    } else {
      onAddTrip(tripToSave);
    }

    onTripProvinceSaved(selectedProvinceId);

    resetForm();
    setIsAddTripOpen(false);
  }

  const selectedProvinceName = selectedProvinceId
    ? getProvinceName(selectedProvinceId)
    : 'Seleccionar provincia';

  const canSaveTrip =
    tripName.trim() &&
    tripStartDate &&
    tripEndDate &&
    selectedProvinceId &&
    tripEndDate >= tripStartDate;

  const isEditingTrip = Boolean(editingTripId);

  const calendarDays = getCalendarDays(visibleMonth);
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.addButton} onPress={openCreateTrip}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Añadir viaje</Text>
        </Pressable>
      </View>

      <View style={styles.tripsSection}>
        <View style={styles.tripsHeader}>
          <Text style={styles.sectionTitle}>Tus viajes</Text>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{trips.length}</Text>
          </View>
        </View>

        {trips.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✈️</Text>

            <Text style={styles.emptyTitle}>Aún no tienes viajes</Text>

            <Text style={styles.emptyText}>
              Pulsa en “Añadir viaje” para guardar tu primera escapada.
            </Text>
          </View>
        ) : (
          <View style={styles.tripList}>
            {trips.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                {trip.imageUri ? (
                  <Image
                    source={{ uri: trip.imageUri }}
                    style={styles.tripImage}
                    resizeMode="cover"
                  />
                ) : null}

                <View style={styles.tripTopRow}>
                  <View style={styles.tripIcon}>
                    <Text style={styles.tripIconText}>✈️</Text>
                  </View>

                  <View style={styles.tripMainInfo}>
                    <Text style={styles.tripName}>{trip.name}</Text>

                    <Text style={styles.tripDate}>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </Text>
                  </View>
                </View>

                <View style={styles.tripProvincePill}>
                  <Text style={styles.tripProvinceText}>
                    {getProvinceName(trip.provinceId)}
                  </Text>
                </View>

                {trip.notes ? (
                  <Text style={styles.tripNotes}>{trip.notes}</Text>
                ) : null}

                <View style={styles.tripActionsRow}>
                  <Pressable
                    style={styles.editTripButton}
                    onPress={() => openEditTrip(trip)}
                  >
                    <Text style={styles.editTripButtonText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteTripButton}
                    onPress={() => onDeleteTrip(trip.id)}
                  >
                    <Text style={styles.deleteTripButtonText}>Borrar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>      <Modal
        visible={isAddTripOpen}
        transparent
        animationType="fade"
        onRequestClose={closePopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalEyebrow}>
                    {isEditingTrip ? 'Editar viaje' : 'Nuevo viaje'}
                  </Text>

                  <Text style={styles.modalTitle}>
                    {isEditingTrip ? 'Editar viaje' : 'Añadir viaje'}
                  </Text>
                </View>

                <Pressable style={styles.closeButton} onPress={closePopup}>
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del viaje</Text>

                <TextInput
                  value={tripName}
                  onChangeText={setTripName}
                  placeholder="Ej. Mallorca 2026"
                  placeholderTextColor="#7F8797"
                  style={styles.input}
                />
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.label}>Fecha inicio</Text>

                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => openCalendar('start')}
                  >
                    <Text
                      style={[
                        styles.datePickerText,
                        !tripStartDate && styles.datePickerPlaceholder,
                      ]}
                    >
                      {tripStartDate
                        ? formatDate(tripStartDate)
                        : 'Seleccionar'}
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.dateInputWrapper}>
                  <Text style={styles.label}>Fecha fin</Text>

                  <Pressable
                    style={styles.datePickerButton}
                    onPress={() => openCalendar('end')}
                  >
                    <Text
                      style={[
                        styles.datePickerText,
                        !tripEndDate && styles.datePickerPlaceholder,
                      ]}
                    >
                      {tripEndDate ? formatDate(tripEndDate) : 'Seleccionar'}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {calendarTarget && (
                <View style={styles.calendarCard}>
                  <View style={styles.calendarHeader}>
                    <Pressable
                      style={styles.calendarNavButton}
                      onPress={goToPreviousMonth}
                    >
                      <Text style={styles.calendarNavText}>‹</Text>
                    </Pressable>

                    <Text style={styles.calendarTitle}>
                      {getMonthLabel(visibleMonth)}
                    </Text>

                    <Pressable
                      style={styles.calendarNavButton}
                      onPress={goToNextMonth}
                    >
                      <Text style={styles.calendarNavText}>›</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.calendarHelper}>
                    {calendarTarget === 'start'
                      ? 'Selecciona la fecha de inicio'
                      : 'Selecciona la fecha de fin'}
                  </Text>

                  <View style={styles.weekDaysRow}>
                    {weekDays.map((weekDay) => (
                      <Text key={weekDay} style={styles.weekDayText}>
                        {weekDay}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.calendarGrid}>
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return (
                          <View
                            key={`empty-${index}`}
                            style={styles.calendarDayPlaceholder}
                          />
                        );
                      }

                      const isoDate = toIsoDate(date);

                      const isSelected =
                        isoDate === tripStartDate || isoDate === tripEndDate;

                      const isDisabled =
                        calendarTarget === 'end' &&
                        !!tripStartDate &&
                        isoDate < tripStartDate;

                      return (
                        <Pressable
                          key={isoDate}
                          style={styles.calendarDay}
                          onPress={() => {
                            if (!isDisabled) {
                              selectCalendarDate(isoDate);
                            }
                          }}
                        >
                          <View
                            style={[
                              styles.calendarDayInner,
                              isSelected && styles.calendarDayInnerSelected,
                              isDisabled && styles.calendarDayInnerDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.calendarDayText,
                                isSelected && styles.calendarDayTextSelected,
                                isDisabled && styles.calendarDayTextDisabled,
                              ]}
                            >
                              {date.getDate()}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  {calendarTarget === 'end' && tripStartDate ? (
                    <Text style={styles.calendarWarning}>
                      No puedes elegir una fecha fin anterior a la fecha inicio.
                    </Text>
                  ) : null}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Imagen del viaje</Text>

                {tripImageUri ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image
                      source={{ uri: tripImageUri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />

                    <View style={styles.imageActionsRow}>
                      <Pressable
                        style={styles.changeImageButton}
                        onPress={pickTripImage}
                      >
                        <Text style={styles.changeImageButtonText}>
                          Cambiar imagen
                        </Text>
                      </Pressable>

                      <Pressable
                        style={styles.removeImageButton}
                        onPress={() => setTripImageUri('')}
                      >
                        <Text style={styles.removeImageButtonText}>Quitar</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable
                    style={styles.imagePickerButton}
                    onPress={pickTripImage}
                  >
                    <Text style={styles.imagePickerIcon}>＋</Text>

                    <Text style={styles.imagePickerText}>Añadir imagen</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Provincia</Text>

                <Pressable
                  style={styles.provinceSelector}
                  onPress={() => {
                    setIsProvinceSelectorOpen((current) => !current);
                    setCalendarTarget(null);
                  }}
                >
                  <Text
                    style={[
                      styles.provinceSelectorText,
                      !selectedProvinceId && styles.provinceSelectorPlaceholder,
                    ]}
                  >
                    {selectedProvinceName}
                  </Text>

                  <Text style={styles.chevron}>
                    {isProvinceSelectorOpen ? '⌃' : '⌄'}
                  </Text>
                </Pressable>

                {isProvinceSelectorOpen && (
                  <View style={styles.provinceDropdown}>
                    <TextInput
                      value={provinceSearch}
                      onChangeText={setProvinceSearch}
                      placeholder="Buscar provincia..."
                      placeholderTextColor="#7F8797"
                      style={styles.searchInput}
                    />

                    <View style={styles.provinceList}>
                      {filteredProvinces.map((province) => {
                        const isSelected = selectedProvinceId === province.id;

                        return (
                          <Pressable
                            key={province.id}
                            style={[
                              styles.provinceOption,
                              isSelected && styles.provinceOptionSelected,
                            ]}
                            onPress={() => {
                              setSelectedProvinceId(province.id);
                              setIsProvinceSelectorOpen(false);
                              setProvinceSearch('');
                            }}
                          >
                            <View>
                              <Text
                                style={[
                                  styles.provinceOptionName,
                                  isSelected &&
                                    styles.provinceOptionNameSelected,
                                ]}
                              >
                                {province.name}
                              </Text>

                              <Text style={styles.provinceOptionCommunity}>
                                {province.community}
                              </Text>
                            </View>

                            {isSelected && (
                              <Text style={styles.selectedCheck}>✓</Text>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Notas</Text>

                <TextInput
                  value={tripNotes}
                  onChangeText={setTripNotes}
                  placeholder="Ej. Cala Millor, Palma, Cuevas del Drach..."
                  placeholderTextColor="#7F8797"
                  style={[styles.input, styles.notesInput]}
                  multiline
                />
              </View>

              <Pressable
                style={[
                  styles.saveButton,
                  !canSaveTrip && styles.saveButtonDisabled,
                ]}
                onPress={saveTrip}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    !canSaveTrip && styles.saveButtonTextDisabled,
                  ]}
                >
                  {isEditingTrip ? 'Guardar cambios' : 'Guardar viaje'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}const styles = StyleSheet.create({
  screen: {
    backgroundColor: appColors.black,
    borderRadius: 28,
    gap: 22,
  },
  header: {
    gap: 18,
  },
  addButton: {
    backgroundColor: appColors.text,
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonIcon: {
    color: appColors.black,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 24,
    fontFamily: appFonts.main,
  },
  addButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripsSection: {
    gap: 14,
  },
  tripsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: appColors.text,
    fontFamily: appFonts.main,
  },
  countPill: {
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 13,
    backgroundColor: appColors.surface,
  },
  countPillText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  emptyCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    fontFamily: appFonts.main,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: appColors.text,
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: appColors.textSecondary,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  tripList: {
    gap: 12,
  },
  tripCard: {
    backgroundColor: appColors.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: appColors.border,
    gap: 12,
    overflow: 'hidden',
  },
  tripImage: {
    width: '100%',
    height: 175,
    borderRadius: 18,
    backgroundColor: appColors.surfaceSoft,
  },
  tripTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tripIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: appColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripIconText: {
    fontSize: 22,
    fontFamily: appFonts.main,
  },
  tripMainInfo: {
    flex: 1,
  },
  tripName: {
    color: appColors.text,
    fontSize: 19,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripDate: {
    color: appColors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 3,
    fontFamily: appFonts.main,
  },
  tripProvincePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderWidth: 1,
    borderColor: appColors.visited,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  tripProvinceText: {
    color: appColors.visited,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  tripNotes: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: appFonts.main,
  },
  tripActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  editTripButton: {
    flex: 1,
    backgroundColor: appColors.white,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editTripButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  deleteTripButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteTripButtonText: {
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
  modalCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '90%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 18,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 2,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalEyebrow: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: appFonts.main,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: appColors.textSecondary,
    fontFamily: appFonts.main,
  },
  input: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    color: appColors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    outlineStyle: 'none' as any,
    fontFamily: appFonts.main,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputWrapper: {
    flex: 1,
    gap: 8,
  },
  datePickerButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  datePickerText: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  datePickerPlaceholder: {
    color: appColors.textMuted,
    fontFamily: appFonts.main,
  },
  calendarCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    color: appColors.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
    fontFamily: appFonts.main,
  },
  calendarTitle: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'capitalize',
    fontFamily: appFonts.main,
  },
  calendarHelper: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: appFonts.main,
  },
  weekDaysRow: {
    flexDirection: 'row',
  },
  weekDayText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDayPlaceholder: {
    width: `${100 / 7}%`,
    height: 42,
  },
  calendarDay: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: appColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: appColors.border,
  },
  calendarDayInnerSelected: {
    backgroundColor: appColors.text,
    borderColor: appColors.text,
  },
  calendarDayInnerDisabled: {
    opacity: 0.25,
  },
  calendarDayText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  calendarDayTextSelected: {
    color: appColors.black,
    fontFamily: appFonts.main,
  },
  calendarDayTextDisabled: {
    color: appColors.textMuted,
    fontFamily: appFonts.main,
  },
  calendarWarning: {
    color: appColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: appFonts.main,
  },
  imagePickerButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderStyle: 'dashed',
    borderRadius: 18,
    minHeight: 118,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerIcon: {
    color: appColors.text,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  imagePickerText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  imagePreviewWrapper: {
    gap: 10,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    backgroundColor: appColors.surfaceSoft,
  },
  imageActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  changeImageButton: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeImageButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  removeImageButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  removeImageButtonText: {
    color: appColors.home,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  notesInput: {
    minHeight: 92,
    textAlignVertical: 'top',
  },
  provinceSelector: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  provinceSelectorText: {
    fontSize: 16,
    fontWeight: '800',
    color: appColors.text,
    fontFamily: appFonts.main,
  },
  provinceSelectorPlaceholder: {
    color: appColors.textMuted,
    fontFamily: appFonts.main,
  },
  chevron: {
    color: appColors.textSecondary,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provinceDropdown: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    padding: 12,
    gap: 12,
  },
  searchInput: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 14,
    color: appColors.text,
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
    outlineStyle: 'none' as any,
    fontFamily: appFonts.main,
  },
  provinceList: {
    gap: 8,
    maxHeight: 260,
  },
  provinceOption: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: appColors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  provinceOptionSelected: {
    borderColor: appColors.visited,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  provinceOptionName: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provinceOptionNameSelected: {
    color: appColors.visited,
    fontFamily: appFonts.main,
  },
  provinceOptionCommunity: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
    fontFamily: appFonts.main,
  },
  selectedCheck: {
    color: appColors.visited,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  saveButton: {
    backgroundColor: appColors.text,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: appColors.surfaceSoft,
  },
  saveButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  saveButtonTextDisabled: {
    color: appColors.textMuted,
    fontFamily: appFonts.main,
  },
});