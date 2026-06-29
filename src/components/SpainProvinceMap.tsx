import { geoMercator, geoPath } from 'd3-geo';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import mapData from '../data/maps/spain-provinces.json';
import { provinces } from '../data/provinces';
import { appColors, appFonts } from '../theme';

export type ProvinceStatus = 'visited' | 'home' | 'wishlist';

type SpainProvinceMapProps = {
  provinceStatuses: Record<string, ProvinceStatus>;
  onSelectProvince: (id: string | null) => void;
  onSetProvinceStatus: (id: string, status: ProvinceStatus) => void;
  onClearProvinceStatus: (id: string) => void;
  selectedProvince: string | null;
};

type GeoFeature = {
  type: string;
  properties: Record<string, any>;
  geometry: any;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getFeatureName(feature: GeoFeature) {
  const properties = feature.properties ?? {};

  return (
    properties.name ??
    properties.NAME ??
    properties.provincia ??
    properties.Provincia ??
    properties.NOMBRE ??
    properties.nombre ??
    ''
  );
}

function getProvinceIdFromFeature(feature: GeoFeature) {
  const featureName = String(getFeatureName(feature));
  const normalizedFeatureName = normalizeText(featureName);

  const directMatch = provinces.find(
    (province) => normalizeText(province.name) === normalizedFeatureName
  );

  if (directMatch) {
    return directMatch.id;
  }

  const manualMatches: Record<string, string> = {
    coruna: 'a_coruna',
    a_coruna: 'a_coruna',
    la_coruna: 'a_coruna',
    balears: 'illes_balears',
    illes_balears: 'illes_balears',
    islas_baleares: 'illes_balears',
    baleares: 'illes_balears',
    santa_cruz_de_tenerife: 'santa_cruz_tenerife',
    santa_cruz_tenerife: 'santa_cruz_tenerife',
    alacant: 'alicante',
    alicante_alacant: 'alicante',
    castello: 'castellon',
    castellon_castello: 'castellon',
    bizkaia: 'bizkaia',
    vizcaya: 'bizkaia',
    gipuzkoa: 'gipuzkoa',
    guipuzcoa: 'gipuzkoa',
    araba: 'alava',
    alava: 'alava',
    ourense: 'ourense',
    orense: 'ourense',
    girona: 'girona',
    gerona: 'girona',
    lleida: 'lleida',
    lerida: 'lleida',
  };

  return manualMatches[normalizedFeatureName] ?? normalizedFeatureName;
}

function getProvinceNameById(id: string | null) {
  if (!id) {
    return null;
  }

  return provinces.find((province) => province.id === id)?.name ?? id;
}

function createFeatureCollection(features: GeoFeature[]) {
  return {
    type: 'FeatureCollection',
    features,
  };
}

function getProvinceFill(status?: ProvinceStatus) {
  if (status === 'home') {
    return appColors.home;
  }

  if (status === 'visited') {
    return appColors.visited;
  }

  if (status === 'wishlist') {
    return appColors.wishlist;
  }

  return appColors.pending;
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

  return 'Sin marcar';
}

export default function SpainProvinceMap({
  provinceStatuses,
  onSelectProvince,
  onSetProvinceStatus,
  onClearProvinceStatus,
  selectedProvince,
}: SpainProvinceMapProps) {
  const geoJson = mapData as any;
  const features: GeoFeature[] = geoJson.features ?? [];

  const safeProvinceStatuses = provinceStatuses ?? {};

  const canaryIds = ['las_palmas', 'santa_cruz_tenerife'];

  const canaryFeatures = features.filter((feature) =>
    canaryIds.includes(getProvinceIdFromFeature(feature))
  );

  const mainFeatures = features.filter(
    (feature) => !canaryIds.includes(getProvinceIdFromFeature(feature))
  );

  const width = 360;
  const height = 430;

  const mainProjection = geoMercator().fitExtent(
    [
      [12, 14],
      [348, 330],
    ],
    createFeatureCollection(mainFeatures) as any
  );

  const canaryProjection = geoMercator().fitExtent(
    [
      [30, 358],
      [154, 414],
    ],
    createFeatureCollection(canaryFeatures) as any
  );

  const mainPathGenerator = geoPath(mainProjection);
  const canaryPathGenerator = geoPath(canaryProjection);

  const selectedProvinceName = getProvinceNameById(selectedProvince);
  const selectedProvinceStatus = selectedProvince
    ? safeProvinceStatuses[selectedProvince]
    : undefined;

  function chooseStatus(status: ProvinceStatus) {
    if (!selectedProvince) {
      return;
    }

    onSetProvinceStatus(selectedProvince, status);
    onSelectProvince(null);
  }

  function clearStatus() {
    if (!selectedProvince) {
      return;
    }

    onClearProvinceStatus(selectedProvince);
    onSelectProvince(null);
  }

  function renderProvince(feature: GeoFeature, index: number, isCanary = false) {
    const provinceId = getProvinceIdFromFeature(feature);
    const provinceStatus = safeProvinceStatuses[provinceId];
    const isSelected = selectedProvince === provinceId;

    const path = isCanary
      ? canaryPathGenerator(feature as any)
      : mainPathGenerator(feature as any);

    if (!path) {
      return null;
    }

    return (
      <G
        key={`${provinceId}-${index}`}
        onPress={() => onSelectProvince(provinceId)}
      >
        <Path
          d={path}
          fill={getProvinceFill(provinceStatus)}
          stroke={isSelected ? appColors.white : '#3A3A3A'}
          strokeWidth={isSelected ? 2.2 : 1}
        />
      </G>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapCard}>
        <View style={styles.mapInfoRow}>
          <View style={styles.mapInfoTextBlock}>
            <Text style={styles.mapInfoTitle}>Mapa de provincias</Text>

            <Text style={styles.mapInfoSubtitle}>
              Toca una provincia para marcarla.
            </Text>
          </View>

          <View style={styles.mapPill}>
            <Text style={styles.mapPillText}>50</Text>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotVisited]} />
            <Text style={styles.legendText}>He ido</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotHome]} />
            <Text style={styles.legendText}>Vivo aquí</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendDotWishlist]} />
            <Text style={styles.legendText}>Quiero ir</Text>
          </View>
        </View>

        <View style={styles.mapCanvas}>
          <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height={460}>
            <Rect
              x={18}
              y={342}
              width={150}
              height={82}
              rx={18}
              fill={appColors.surfaceSoft}
              stroke={appColors.border}
              strokeWidth={1}
            />

            <SvgText
              x={34}
              y={362}
              fontSize={11}
              fontWeight="700"
              fill={appColors.textMuted}
              fontFamily={appFonts.main}
            >
              Canarias
            </SvgText>

            <G>
              {mainFeatures.map((feature, index) =>
                renderProvince(feature, index)
              )}
            </G>

            <G>
              {canaryFeatures.map((feature, index) =>
                renderProvince(feature, index, true)
              )}
            </G>
          </Svg>

          {selectedProvince && (
            <View style={styles.popupCard}>
              <View style={styles.popupTopRow}>
                <View style={styles.popupTitleBlock}>
                  <Text style={styles.popupEyebrow}>Provincia</Text>

                  <Text style={styles.popupTitle}>{selectedProvinceName}</Text>

                  <Text style={styles.popupSubtitle}>
                    Estado actual: {getStatusLabel(selectedProvinceStatus)}
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => onSelectProvince(null)}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </Pressable>
              </View>              <View style={styles.optionsColumn}>
                <Pressable
                  style={[
                    styles.optionButton,
                    selectedProvinceStatus === 'home' &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => chooseStatus('home')}
                >
                  <View style={[styles.optionDot, styles.homeDot]} />

                  <Text
                    style={[
                      styles.optionText,
                      selectedProvinceStatus === 'home' &&
                        styles.optionTextActive,
                    ]}
                  >
                    Vivo aquí
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.optionButton,
                    selectedProvinceStatus === 'visited' &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => chooseStatus('visited')}
                >
                  <View style={[styles.optionDot, styles.visitedDot]} />

                  <Text
                    style={[
                      styles.optionText,
                      selectedProvinceStatus === 'visited' &&
                        styles.optionTextActive,
                    ]}
                  >
                    He ido
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.optionButton,
                    selectedProvinceStatus === 'wishlist' &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => chooseStatus('wishlist')}
                >
                  <View style={[styles.optionDot, styles.wishlistDot]} />

                  <Text
                    style={[
                      styles.optionText,
                      selectedProvinceStatus === 'wishlist' &&
                        styles.optionTextActive,
                    ]}
                  >
                    Quiero ir
                  </Text>
                </Pressable>
              </View>

              <Pressable style={styles.clearButton} onPress={clearStatus}>
                <Text style={styles.clearButtonText}>Quitar estado</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  mapCard: {
    backgroundColor: appColors.surface,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: appColors.border,
    gap: 14,
    overflow: 'hidden',
  },
  mapInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  mapInfoTextBlock: {
    flex: 1,
  },
  mapInfoTitle: {
    color: appColors.text,
    fontSize: 22,
    fontWeight: '900',
    fontFamily: appFonts.main,
    marginBottom: 4,
  },
  mapInfoSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  mapPill: {
    width: 46,
    height: 34,
    borderRadius: 999,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPillText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDotVisited: {
    backgroundColor: appColors.visited,
  },
  legendDotHome: {
    backgroundColor: appColors.home,
  },
  legendDotWishlist: {
    backgroundColor: appColors.wishlist,
  },
  legendText: {
    color: appColors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  mapCanvas: {
    position: 'relative',
    backgroundColor: appColors.black,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  popupCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 15,
    gap: 13,
  },
  popupTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  popupTitleBlock: {
    flex: 1,
  },
  popupEyebrow: {
    color: appColors.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  popupTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
    fontFamily: appFonts.main,
  },
  popupSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
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
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: appFonts.main,
  },
  optionsColumn: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionButtonActive: {
    borderColor: appColors.white,
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  homeDot: {
    backgroundColor: appColors.home,
  },
  visitedDot: {
    backgroundColor: appColors.visited,
  },
  wishlistDot: {
    backgroundColor: appColors.wishlist,
  },
  optionText: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  optionTextActive: {
    color: appColors.text,
  },
  clearButton: {
    backgroundColor: appColors.white,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clearButtonText: {
    color: appColors.black,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});