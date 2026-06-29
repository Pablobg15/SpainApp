import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { provinces } from '../data/provinces';

type MapZone = {
  id: string;
  path: string;
  labelX: number;
  labelY: number;
};

const mapZones: MapZone[] = [
  {
    id: 'asturias',
    path: 'M120 70 L220 60 L250 95 L140 105 Z',
    labelX: 165,
    labelY: 88,
  },
  {
    id: 'a_coruna',
    path: 'M55 90 L130 70 L140 160 L70 185 L35 140 Z',
    labelX: 72,
    labelY: 130,
  },
  {
    id: 'cantabria',
    path: 'M220 60 L305 65 L310 100 L250 95 Z',
    labelX: 245,
    labelY: 83,
  },
  {
    id: 'madrid',
    path: 'M245 210 L315 205 L335 270 L265 285 Z',
    labelX: 282,
    labelY: 248,
  },
  {
    id: 'sevilla',
    path: 'M150 360 L260 350 L280 435 L170 460 L110 415 Z',
    labelX: 175,
    labelY: 405,
  },
  {
    id: 'valencia',
    path: 'M420 205 L505 230 L485 340 L405 315 Z',
    labelX: 440,
    labelY: 275,
  },
  {
    id: 'barcelona',
    path: 'M415 85 L520 95 L550 180 L470 220 L410 160 Z',
    labelX: 450,
    labelY: 148,
  },
  {
    id: 'illes_balears',
    path: 'M585 285 L625 275 L650 300 L620 325 Z',
    labelX: 588,
    labelY: 306,
  },
  {
    id: 'las_palmas',
    path: 'M80 520 L190 505 L230 555 L100 575 Z',
    labelX: 115,
    labelY: 545,
  },
];

type SpainMapProps = {
  visited: string[];
  onToggleProvince: (id: string) => void;
  selectedProvince: string | null;
};

function getProvinceName(id: string) {
  return provinces.find((province) => province.id === id)?.name ?? id;
}

export default function SpainMap({
  visited,
  onToggleProvince,
  selectedProvince,
}: SpainMapProps) {
  const selectedName = selectedProvince ? getProvinceName(selectedProvince) : null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapCard}>
        <Svg viewBox="0 0 700 620" width="100%" height={390}>
          {mapZones.map((zone) => {
            const isVisited = visited.includes(zone.id);

            return (
              <Path
                key={zone.id}
                d={zone.path}
                fill={isVisited ? '#C05A2B' : '#EFE7DC'}
                stroke="#FFFFFF"
                strokeWidth={4}
                onPress={() => onToggleProvince(zone.id)}
              />
            );
          })}

          {mapZones.map((zone) => {
            const isVisited = visited.includes(zone.id);

            return (
              <SvgText
                key={`${zone.id}-label`}
                x={zone.labelX}
                y={zone.labelY}
                fontSize="18"
                fontWeight="700"
                fill={isVisited ? '#FFFFFF' : '#6F6258'}
                onPress={() => onToggleProvince(zone.id)}
              >
                {getProvinceName(zone.id)}
              </SvgText>
            );
          })}
        </Svg>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          {selectedName ? selectedName : 'Toca una provincia del mapa'}
        </Text>

        <Text style={styles.infoText}>
          Toca una provincia para marcarla o desmarcarla como visitada.
        </Text>

        <Text style={styles.helperText}>
          Este mapa todavía es provisional. El perfil ya calcula el progreso
          sobre las 50 provincias reales.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DED0',
  },
  infoCard: {
    backgroundColor: '#FFF6E8',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DED0',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#777',
  },
});