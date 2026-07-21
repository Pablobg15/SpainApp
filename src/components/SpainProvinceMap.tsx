import { geoMercator, geoPath } from 'd3-geo';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import mapData from '../data/maps/spain-provinces.json';
import { provinces } from '../data/provinces';
import { appFonts } from '../theme';

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

const atlasColors = {
  paper: '#E9DFC8',
  paperDark: '#D8C9A8',
  ink: '#3B3024',
  inkSoft: '#6F614E',
  border: '#9E8F72',
  sea: '#D7E0D6',
  seaLight: '#E5ECDF',
  seaDark: '#C8D2C3',
  pending: '#EFE5CC',
  visited: '#B9D6B1',
  home: '#E3A39A',
  wishlist: '#E4CF82',
  selected: '#3B3024',
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
    return atlasColors.home;
  }

  if (status === 'visited') {
    return atlasColors.visited;
  }

  if (status === 'wishlist') {
    return atlasColors.wishlist;
  }

  return atlasColors.pending;
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
}export default function SpainProvinceMap({
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

  const width = 390;
  const height = 510;

  const visitedCount = Object.values(safeProvinceStatuses).filter(
    (status) => status === 'visited' || status === 'home'
  ).length;

  const progress = Math.round((visitedCount / provinces.length) * 100);

  const mainProjection = geoMercator().fitExtent(
    [
      [12, 64],
      [378, 395],
    ],
    createFeatureCollection(mainFeatures) as any
  );

  const canaryProjection = geoMercator().fitExtent(
    [
      [42, 434],
      [176, 494],
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

  const pressHandlers =
    Platform.OS === 'web'
      ? ({
          onClick: (event: any) => {
            event?.stopPropagation?.();
            onSelectProvince(provinceId);
          },
        } as any)
      : {
          onPress: () => onSelectProvince(provinceId),
        };

  return (
    <G key={`${provinceId}-${index}`} {...pressHandlers}>
      {isSelected ? (
        <Path
          d={path}
          fill="transparent"
          stroke={atlasColors.selected}
          strokeWidth={6}
          opacity={0.45}
        />
      ) : null}

      <Path
        d={path}
        fill={getProvinceFill(provinceStatus)}
        stroke={isSelected ? atlasColors.selected : atlasColors.border}
        strokeWidth={isSelected ? 2.2 : 0.9}
      />
    </G>
  );
}

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapCard}>
        <View style={styles.atlasHeader}>
          <View style={styles.atlasTitleBlock}>
            <Text style={styles.atlasEyebrow}>Atlas personal</Text>
            <Text style={styles.atlasTitle}>ESPAÑA</Text>
            <Text style={styles.atlasSubtitle}>
              Provincias visitadas y pendientes
            </Text>
          </View>

          <View style={styles.atlasProgressBox}>
            <Text style={styles.atlasProgressNumber}>{progress}%</Text>
            <Text style={styles.atlasProgressLabel}>
              {visitedCount}/{provinces.length}
            </Text>
          </View>
        </View>

        <View style={styles.atlasProgressBar}>
          <View
            style={[styles.atlasProgressFill, { width: `${progress}%` }]}
          />
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

        <View style={styles.mapHintCard}>
          <Text style={styles.mapHintText}>
            Toca una provincia para cambiar su estado.
          </Text>
        </View>

        <View style={styles.mapCanvas}>
          <Svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={atlasColors.sea}
            />

            <Circle
              cx={64}
              cy={180}
              r={135}
              fill={atlasColors.seaLight}
              opacity={0.55}
            />

            <Circle
              cx={328}
              cy={250}
              r={105}
              fill={atlasColors.seaDark}
              opacity={0.4}
            />

            <Circle
              cx={205}
              cy={515}
              r={150}
              fill={atlasColors.seaLight}
              opacity={0.45}
            />

            <SvgText
              x={24}
              y={38}
              fontSize={20}
              fontWeight="700"
              fill={atlasColors.ink}
              fontFamily={appFonts.main}
            >
              España
            </SvgText>

            <SvgText
              x={25}
              y={57}
              fontSize={9}
              fontWeight="700"
              fill={atlasColors.inkSoft}
              fontFamily={appFonts.main}
            >
              mapa de provincias
            </SvgText>

            <Rect
              x={24}
              y={424}
              width={162}
              height={74}
              rx={10}
              fill={atlasColors.pending}
              opacity={0.78}
              stroke={atlasColors.border}
              strokeWidth={0.9}
            />

            <SvgText
              x={39}
              y={444}
              fontSize={10}
              fontWeight="700"
              fill={atlasColors.inkSoft}
              fontFamily={appFonts.main}
            >
              Islas Canarias
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
              </View>

              <View style={styles.optionsColumn}>
                <Pressable
                  style={[
                    styles.optionButton,
                    selectedProvinceStatus === 'home' &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() => chooseStatus('home')}
                >
                  <View style={[styles.optionDot, styles.homeDot]} />
                  <Text style={styles.optionText}>Vivo aquí</Text>
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
                  <Text style={styles.optionText}>He ido</Text>
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
                  <Text style={styles.optionText}>Quiero ir</Text>
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
}const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  mapCard: {
    backgroundColor: atlasColors.paper,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: atlasColors.border,
    gap: 14,
    overflow: 'hidden',
  },
  atlasHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  atlasTitleBlock: {
    flex: 1,
  },
  atlasEyebrow: {
    color: atlasColors.inkSoft,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  atlasTitle: {
    color: atlasColors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1.8,
    lineHeight: 38,
    fontFamily: appFonts.main,
  },
  atlasSubtitle: {
    color: atlasColors.inkSoft,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    fontFamily: appFonts.main,
  },
  atlasProgressBox: {
    backgroundColor: 'rgba(255, 248, 230, 0.78)',
    borderWidth: 1,
    borderColor: atlasColors.border,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  atlasProgressNumber: {
    color: atlasColors.ink,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  atlasProgressLabel: {
    color: atlasColors.inkSoft,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
    fontFamily: appFonts.main,
  },
  atlasProgressBar: {
    height: 10,
    backgroundColor: atlasColors.paperDark,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 48, 36, 0.12)',
  },
  atlasProgressFill: {
    height: '100%',
    backgroundColor: atlasColors.visited,
    borderRadius: 999,
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
    backgroundColor: 'rgba(255, 248, 230, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(59, 48, 36, 0.14)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(59, 48, 36, 0.2)',
  },
  legendDotVisited: {
    backgroundColor: atlasColors.visited,
  },
  legendDotHome: {
    backgroundColor: atlasColors.home,
  },
  legendDotWishlist: {
    backgroundColor: atlasColors.wishlist,
  },
  legendText: {
    color: atlasColors.inkSoft,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  mapHintCard: {
    backgroundColor: 'rgba(255, 248, 230, 0.62)',
    borderWidth: 1,
    borderColor: 'rgba(59, 48, 36, 0.14)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mapHintText: {
    color: atlasColors.inkSoft,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    fontFamily: appFonts.main,
  },
  mapCanvas: {
    position: 'relative',
    height: 560,
    backgroundColor: atlasColors.sea,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: atlasColors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCard: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: '#F6EBD1',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: atlasColors.border,
    padding: 15,
    gap: 13,
    zIndex: 5,
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
    color: atlasColors.inkSoft,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: appFonts.main,
  },
  popupTitle: {
    color: atlasColors.ink,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
    fontFamily: appFonts.main,
  },
  popupSubtitle: {
    color: atlasColors.inkSoft,
    fontSize: 14,
    marginTop: 4,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: atlasColors.paperDark,
    borderWidth: 1,
    borderColor: atlasColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: atlasColors.ink,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: appFonts.main,
  },
  optionsColumn: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 248, 230, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(59, 48, 36, 0.16)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionButtonActive: {
    borderColor: atlasColors.ink,
    backgroundColor: '#FFF7E4',
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(59, 48, 36, 0.18)',
  },
  homeDot: {
    backgroundColor: atlasColors.home,
  },
  visitedDot: {
    backgroundColor: atlasColors.visited,
  },
  wishlistDot: {
    backgroundColor: atlasColors.wishlist,
  },
  optionText: {
    color: atlasColors.ink,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  clearButton: {
    backgroundColor: atlasColors.ink,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFF7E4',
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});