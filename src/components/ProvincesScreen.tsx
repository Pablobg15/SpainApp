import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getProvinceInfoById } from '../data/provinceInfo';
import { Province, provinces } from '../data/provinces';
import { appColors, appFonts } from '../theme';
import { ProvinceStatus } from './SpainProvinceMap';

type ProvincesScreenProps = {
  provinceStatuses: Record<string, ProvinceStatus>;
};

type StatusFilter = 'all' | 'visited' | 'home' | 'wishlist' | 'pending';

const statusFilters: Array<{
  id: StatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'Todas' },
  { id: 'visited', label: 'He ido' },
  { id: 'home', label: 'Vivo aquí' },
  { id: 'wishlist', label: 'Quiero ir' },
  { id: 'pending', label: 'Pendientes' },
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getStatusLabel(status?: ProvinceStatus) {
  if (status === 'home') {
    return 'Vivo aquí';
  }

  if (status === 'visited') {
    return 'He ido';
  }

  if (status === 'wishlist') {
    return 'Quiero ir';
  }

  return 'Pendiente';
}

function getStatusColor(status?: ProvinceStatus) {
  if (status === 'home') {
    return appColors.home;
  }

  if (status === 'visited') {
    return appColors.visited;
  }

  if (status === 'wishlist') {
    return appColors.wishlist;
  }

  return appColors.textMuted;
}

function getFilteredStatus(status?: ProvinceStatus): StatusFilter {
  if (!status) {
    return 'pending';
  }

  return status;
}

export default function ProvincesScreen({
  provinceStatuses,
}: ProvincesScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );

  const filteredProvinces = useMemo(() => {
    const normalizedSearch = normalizeText(searchText.trim());

    return provinces.filter((province) => {
      const provinceStatus = provinceStatuses[province.id];
      const filteredStatus = getFilteredStatus(provinceStatus);

      const matchesFilter =
        activeFilter === 'all' || activeFilter === filteredStatus;

      const matchesSearch =
        !normalizedSearch ||
        normalizeText(province.name).includes(normalizedSearch) ||
        normalizeText(province.community).includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, provinceStatuses, searchText]);

  const selectedProvinceInfo = selectedProvince
    ? (getProvinceInfoById(selectedProvince.id) as any)
    : null;

  const selectedProvinceStatus = selectedProvince
    ? provinceStatuses[selectedProvince.id]
    : undefined;

  const highlights = Array.isArray(selectedProvinceInfo?.highlights)
    ? selectedProvinceInfo.highlights
    : [];

  const tags = Array.isArray(selectedProvinceInfo?.tags)
    ? selectedProvinceInfo.tags
    : [];

  const capital =
    selectedProvinceInfo?.capital ??
    selectedProvinceInfo?.capitalName ??
    'Dato no disponible';

  const population =
    selectedProvinceInfo?.population ??
    selectedProvinceInfo?.populationLabel ??
    selectedProvinceInfo?.inhabitants ??
    'Dato no disponible';

  return (
    <View style={styles.screen}>
      <View style={styles.searchCard}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar provincia o comunidad..."
          placeholderTextColor={appColors.textMuted}
          style={styles.searchInput}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {statusFilters.map((filter) => {
            const isActive = activeFilter === filter.id;

            return (
              <Pressable
                key={filter.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Listado de provincias</Text>

        <View style={styles.resultsPill}>
          <Text style={styles.resultsPillText}>{filteredProvinces.length}</Text>
        </View>
      </View>

      <View style={styles.provinceList}>
        {filteredProvinces.map((province) => {
          const status = provinceStatuses[province.id];
          const statusColor = getStatusColor(status);

          return (
            <Pressable
              key={province.id}
              style={styles.provinceCard}
              onPress={() => setSelectedProvince(province)}
            >
              <View style={styles.provinceCardTop}>
                <View style={styles.provinceInitial}>
                  <Text style={styles.provinceInitialText}>
                    {province.name.charAt(0)}
                  </Text>
                </View>

                <View style={styles.provinceMainInfo}>
                  <Text style={styles.provinceName}>{province.name}</Text>

                  <Text style={styles.provinceCommunity}>
                    {province.community}
                  </Text>
                </View>
              </View>

              <View style={styles.provinceCardBottom}>
                <View style={styles.statusPill}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: statusColor,
                      },
                    ]}
                  />

                  <Text style={styles.statusText}>
                    {getStatusLabel(status)}
                  </Text>
                </View>

                <Text style={styles.cardArrow}>›</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Modal
        visible={!!selectedProvince}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedProvince(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalEyebrow}>
                    {selectedProvince?.community ?? ''}
                  </Text>

                  <Text style={styles.modalTitle}>
                    {selectedProvince?.name ?? ''}
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setSelectedProvince(null)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>

              <View style={styles.modalStatusCard}>
                <View
                  style={[
                    styles.modalStatusDot,
                    {
                      backgroundColor: getStatusColor(selectedProvinceStatus),
                    },
                  ]}
                />

                <View>
                  <Text style={styles.modalStatusLabel}>Estado</Text>

                  <Text style={styles.modalStatusValue}>
                    {getStatusLabel(selectedProvinceStatus)}
                  </Text>
                </View>
              </View>              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Capital</Text>

                  <Text style={styles.infoValue}>{capital}</Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Población</Text>

                  <Text style={styles.infoValue}>{population}</Text>
                </View>
              </View>

              {selectedProvinceInfo?.description ? (
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionTitle}>Sobre la provincia</Text>

                  <Text style={styles.descriptionText}>
                    {selectedProvinceInfo.description}
                  </Text>
                </View>
              ) : null}

              {highlights.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Qué ver</Text>

                  <View style={styles.highlightsList}>
                    {highlights.map((highlight: string) => (
                      <View key={highlight} style={styles.highlightRow}>
                        <View style={styles.highlightBullet} />

                        <Text style={styles.highlightText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {tags.length > 0 ? (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Etiquetas</Text>

                  <View style={styles.tagsRow}>
                    {tags.map((tag: string) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagChipText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable
                style={styles.closeModalButton}
                onPress={() => setSelectedProvince(null)}
              >
                <Text style={styles.closeModalButtonText}>Cerrar</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: appColors.black,
    borderRadius: 28,
    gap: 16,
  },
  searchCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: appColors.border,
    gap: 12,
  },
  searchInput: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 17,
    color: appColors.text,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
    outlineStyle: 'none' as any,
    fontFamily: appFonts.main,
  },
  filtersRow: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: appColors.white,
    borderColor: appColors.white,
  },
  filterChipText: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  filterChipTextActive: {
    color: appColors.black,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultsTitle: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  resultsPill: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  resultsPillText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provinceList: {
    gap: 12,
  },
  provinceCard: {
    backgroundColor: appColors.surface,
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    borderColor: appColors.border,
    gap: 13,
  },
  provinceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  provinceInitial: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provinceInitialText: {
    color: appColors.black,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  provinceMainInfo: {
    flex: 1,
  },
  provinceName: {
    color: appColors.text,
    fontSize: 19,
    fontWeight: '900',
    fontFamily: appFonts.main,
    marginBottom: 3,
  },
  provinceCommunity: {
    color: appColors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: appFonts.main,
  },
  provinceCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusText: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  cardArrow: {
    color: appColors.textMuted,
    fontSize: 27,
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
    maxHeight: '88%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalEyebrow: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: appFonts.main,
    marginBottom: 5,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
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
  modalStatusCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalStatusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  modalStatusLabel: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: appFonts.main,
    marginBottom: 2,
  },
  modalStatusValue: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    padding: 13,
  },
  infoLabel: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  infoValue: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  descriptionCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  descriptionTitle: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
    fontFamily: appFonts.main,
  },
  descriptionText: {
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: appFonts.main,
  },
  sectionBlock: {
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  highlightsList: {
    gap: 9,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  highlightBullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: appColors.white,
    marginTop: 7,
  },
  highlightText: {
    flex: 1,
    color: appColors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: appFonts.main,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  tagChipText: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  closeModalButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 2,
  },
  closeModalButtonText: {
    color: appColors.black,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});