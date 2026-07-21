import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { appColors, appFonts } from '../theme';

type LegalSection = 'legal' | 'privacy' | 'terms';

type LegalFooterProps = {
  variant?: 'default' | 'bottomBar';
};

type LegalContent = {
  title: string;
  updatedAt: string;
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
};

const APP_NAME = 'SpainApp';
const CONTACT_EMAIL = 'tu-email@dominio.com';

const legalContents: Record<LegalSection, LegalContent> = {
  legal: {
    title: 'Aviso legal',
    updatedAt: 'Última actualización: julio de 2026',
    sections: [
      {
        heading: 'Titular de la app',
        paragraphs: [
          `${APP_NAME} es una aplicación para registrar provincias visitadas, viajes, retos y progreso dentro de España.`,
          `Para cualquier consulta relacionada con la aplicación puedes escribir a: ${CONTACT_EMAIL}.`,
        ],
      },
      {
        heading: 'Uso de la aplicación',
        paragraphs: [
          'El usuario se compromete a utilizar la aplicación de forma correcta, respetuosa y conforme a la ley.',
          'No está permitido usar la app para subir contenido ofensivo, ilegal, engañoso o que vulnere derechos de terceros.',
        ],
      },
      {
        heading: 'Responsabilidad',
        paragraphs: [
          'La información mostrada en la app tiene una finalidad organizativa y personal.',
          'Aunque intentamos mantener la app disponible y funcionando correctamente, no podemos garantizar que esté libre de errores o interrupciones.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    updatedAt: 'Última actualización: julio de 2026',
    sections: [
      {
        heading: 'Datos que podemos recoger',
        paragraphs: [
          'La app puede recoger datos como email, nombre de perfil, foto de perfil, provincias marcadas, viajes creados, imágenes de viajes y relaciones de amistad dentro de la app.',
          'Estos datos se utilizan para permitir el funcionamiento de la cuenta, guardar el progreso, mostrar el perfil y sincronizar la información entre dispositivos.',
        ],
      },
      {
        heading: 'Almacenamiento de datos',
        paragraphs: [
          'Los datos de usuario se almacenan en servicios externos necesarios para el funcionamiento de la app, como autenticación, base de datos y almacenamiento de imágenes.',
          'Las imágenes que el usuario sube, como fotos de perfil o fotos de viajes, se utilizan únicamente dentro de las funcionalidades de la app.',
        ],
      },
      {
        heading: 'Amigos y visibilidad',
        paragraphs: [
          'La app puede permitir que otros usuarios vean cierta información de tu perfil si existe una relación de amistad aceptada dentro de la aplicación.',
          'La información visible puede incluir nombre, foto de perfil, progreso, provincias marcadas y viajes, según las funciones disponibles en la app.',
        ],
      },
      {
        heading: 'Eliminación de cuenta',
        paragraphs: [
          'El usuario puede solicitar o ejecutar la eliminación de su cuenta desde la propia app.',
          'Al eliminar la cuenta, se eliminarán los datos asociados a ella en la medida en que técnicamente sea posible dentro de los servicios utilizados por la aplicación.',
        ],
      },
      {
        heading: 'Contacto',
        paragraphs: [
          `Para resolver dudas sobre privacidad o datos personales, puedes escribir a: ${CONTACT_EMAIL}.`,
        ],
      },
    ],
  },
  terms: {
    title: 'Términos y condiciones',
    updatedAt: 'Última actualización: julio de 2026',
    sections: [
      {
        heading: 'Aceptación de los términos',
        paragraphs: [
          `Al utilizar ${APP_NAME}, aceptas estos términos de uso.`,
          'Si no estás de acuerdo con ellos, deberías dejar de utilizar la aplicación.',
        ],
      },
      {
        heading: 'Cuenta de usuario',
        paragraphs: [
          'Para usar determinadas funciones de la app es necesario crear una cuenta.',
          'El usuario es responsable de mantener la seguridad de su cuenta y de los datos que introduce en la aplicación.',
        ],
      },
      {
        heading: 'Contenido del usuario',
        paragraphs: [
          'El usuario puede añadir viajes, notas, fotos y otra información personal dentro de la app.',
          'El usuario declara que tiene derecho a subir ese contenido y que no vulnera derechos de terceros.',
        ],
      },
      {
        heading: 'Cambios en la app',
        paragraphs: [
          'La aplicación puede cambiar, mejorar, añadir o eliminar funcionalidades con el tiempo.',
          'También podrán actualizarse estos términos para adaptarlos a nuevas funciones o requisitos.',
        ],
      },
    ],
  },
};

type LegalModalProps = {
  section: LegalSection | null;
  onClose: () => void;
};

function LegalModal({ section, onClose }: LegalModalProps) {
  const content = section ? legalContents[section] : null;

  return (
    <Modal
      visible={Boolean(content)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleBlock}>
              <Text style={styles.modalTitle}>{content?.title}</Text>
              <Text style={styles.modalUpdatedAt}>{content?.updatedAt}</Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content?.sections.map((item) => (
              <View key={item.heading} style={styles.legalBlock}>
                <Text style={styles.legalHeading}>{item.heading}</Text>

                {item.paragraphs.map((paragraph) => (
                  <Text key={paragraph} style={styles.legalParagraph}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            ))}

            <Text style={styles.legalNote}>
              Este texto es una base inicial para la app. Antes de publicarla,
              conviene revisarlo y sustituir el email de contacto por uno real.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function LegalFooter({
  variant = 'default',
}: LegalFooterProps) {
  const [activeSection, setActiveSection] = useState<LegalSection | null>(null);

  const isBottomBar = variant === 'bottomBar';

  return (
    <>
      <View style={[styles.footer, isBottomBar && styles.footerBottomBar]}>
        {!isBottomBar ? (
          <>
            <Text style={styles.footerBrand}>{APP_NAME}</Text>

            <Text style={styles.footerText}>
              © 2026 {APP_NAME}. Todos los derechos reservados.
            </Text>
          </>
        ) : null}

        <View
          style={[
            styles.footerLinks,
            isBottomBar && styles.footerLinksBottomBar,
          ]}
        >
          <Pressable onPress={() => setActiveSection('legal')}>
            <Text
              style={[
                styles.footerLink,
                isBottomBar && styles.footerLinkBottomBar,
              ]}
            >
              Aviso legal
            </Text>
          </Pressable>

          <Text
            style={[
              styles.footerSeparator,
              isBottomBar && styles.footerSeparatorBottomBar,
            ]}
          >
            ·
          </Text>

          <Pressable onPress={() => setActiveSection('privacy')}>
            <Text
              style={[
                styles.footerLink,
                isBottomBar && styles.footerLinkBottomBar,
              ]}
            >
              Privacidad
            </Text>
          </Pressable>

          <Text
            style={[
              styles.footerSeparator,
              isBottomBar && styles.footerSeparatorBottomBar,
            ]}
          >
            ·
          </Text>

          <Pressable onPress={() => setActiveSection('terms')}>
            <Text
              style={[
                styles.footerLink,
                isBottomBar && styles.footerLinkBottomBar,
              ]}
            >
              Términos
            </Text>
          </Pressable>
        </View>
      </View>

      <LegalModal
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 22,
    marginBottom: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    gap: 7,
  },
  footerBottomBar: {
    marginTop: 6,
    marginBottom: 0,
    paddingVertical: 3,
    paddingHorizontal: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  footerBrand: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  footerText: {
    color: appColors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    fontFamily: appFonts.main,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  footerLinksBottomBar: {
    marginTop: 0,
    gap: 7,
  },
  footerLink: {
    color: appColors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
    textDecorationLine: 'underline',
    fontFamily: appFonts.main,
  },
  footerLinkBottomBar: {
    color: appColors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  footerSeparator: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  footerSeparatorBottomBar: {
    color: appColors.textMuted,
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '86%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  modalUpdatedAt: {
    color: appColors.textMuted,
    fontSize: 12,
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
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    padding: 18,
    gap: 18,
  },
  legalBlock: {
    gap: 8,
  },
  legalHeading: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  legalParagraph: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: appFonts.main,
  },
  legalNote: {
    color: appColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: appColors.border,
    paddingTop: 14,
    fontFamily: appFonts.main,
  },
});