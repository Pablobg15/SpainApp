import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { challenges } from '../data/challenges';
import { provinces } from '../data/provinces';
import {
  acceptFriendRequest,
  fetchFriends,
  fetchReceivedFriendRequests,
  fetchSentFriendRequests,
  rejectFriendRequest,
  removeFriendRequest,
  searchProfiles,
  sendFriendRequest,
  type FriendRequest,
  type PublicProfile,
} from '../lib/friends';
import { fetchProvinceStatuses } from '../lib/provinceStatuses';
import { fetchTrips } from '../lib/trips';
import { appColors, appFonts } from '../theme';
import type { ProvinceStatus } from './SpainProvinceMap';
import type { Trip } from './TripsScreen';

type FriendsScreenProps = {
  userId: string;
};

type FriendProfileData = {
  provinceStatuses: Record<string, ProvinceStatus>;
  trips: Trip[];
};

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

function getProvinceName(provinceId: string) {
  return provinces.find((province) => province.id === provinceId)?.name ?? '';
}

function getInitial(name: string) {
  return (name || 'U').charAt(0).toUpperCase();
}

export default function FriendsScreen({ userId }: FriendsScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<PublicProfile[]>([]);

  const [selectedFriend, setSelectedFriend] = useState<PublicProfile | null>(
    null
  );
  const [selectedFriendData, setSelectedFriendData] =
    useState<FriendProfileData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFriendProfileLoading, setIsFriendProfileLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [message, setMessage] = useState('');

  async function loadFriendsData() {
    try {
      setIsLoading(true);
      setMessage('');

      const [received, sent, acceptedFriends] = await Promise.all([
        fetchReceivedFriendRequests(userId),
        fetchSentFriendRequests(userId),
        fetchFriends(userId),
      ]);

      setReceivedRequests(received);
      setSentRequests(sent);
      setFriends(acceptedFriends);
    } catch (error) {
      console.log('Error loading friends data:', error);
      setMessage('No se pudieron cargar tus amigos.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFriendsData();
  }, [userId]);

  async function handleSearch() {
    const cleanSearchText = searchText.trim();

    if (cleanSearchText.length < 2) {
      setSearchResults([]);
      setMessage('Escribe al menos 2 letras para buscar.');
      return;
    }

    try {
      setIsSearching(true);
      setMessage('');

      const results = await searchProfiles(userId, cleanSearchText);

      setSearchResults(results);

      if (results.length === 0) {
        setMessage('No se encontraron usuarios con ese nombre.');
      }
    } catch (error) {
      console.log('Error searching profiles:', error);
      setMessage('No se pudo buscar usuarios.');
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSendFriendRequest(profile: PublicProfile) {
    try {
      setActionLoadingId(profile.id);
      setMessage('');

      await sendFriendRequest(userId, profile.id);

      setSearchResults((currentResults) =>
        currentResults.filter((result) => result.id !== profile.id)
      );

      await loadFriendsData();

      setMessage(`Solicitud enviada a ${profile.name}.`);
    } catch (error) {
      console.log('Error sending friend request:', error);
      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo enviar la solicitud.'
      );
    } finally {
      setActionLoadingId('');
    }
  }

  async function handleAcceptRequest(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);
      setMessage('');

      await acceptFriendRequest(request.id);
      await loadFriendsData();

      setMessage('Solicitud aceptada.');
    } catch (error) {
      console.log('Error accepting friend request:', error);
      setMessage('No se pudo aceptar la solicitud.');
    } finally {
      setActionLoadingId('');
    }
  }

  async function handleRejectRequest(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);
      setMessage('');

      await rejectFriendRequest(request.id);
      await loadFriendsData();

      setMessage('Solicitud rechazada.');
    } catch (error) {
      console.log('Error rejecting friend request:', error);
      setMessage('No se pudo rechazar la solicitud.');
    } finally {
      setActionLoadingId('');
    }
  }

  async function handleCancelSentRequest(request: FriendRequest) {
    try {
      setActionLoadingId(request.id);
      setMessage('');

      await removeFriendRequest(request.id);
      await loadFriendsData();

      setMessage('Solicitud cancelada.');
    } catch (error) {
      console.log('Error canceling friend request:', error);
      setMessage('No se pudo cancelar la solicitud.');
    } finally {
      setActionLoadingId('');
    }
  }

  async function openFriendProfile(friend: PublicProfile) {
    try {
      setSelectedFriend(friend);
      setSelectedFriendData(null);
      setIsFriendProfileLoading(true);
      setMessage('');

      const [friendStatuses, friendTrips] = await Promise.all([
        fetchProvinceStatuses(friend.id),
        fetchTrips(friend.id),
      ]);

      setSelectedFriendData({
        provinceStatuses: friendStatuses,
        trips: friendTrips,
      });
    } catch (error) {
      console.log('Error loading friend profile:', error);
      setMessage('No se pudo cargar el perfil de este amigo.');
    } finally {
      setIsFriendProfileLoading(false);
    }
  }

  function closeFriendProfile() {
    setSelectedFriend(null);
    setSelectedFriendData(null);
    setIsFriendProfileLoading(false);
  }

  function renderAvatar(profile: PublicProfile, size: 'small' | 'large') {
    const isLarge = size === 'large';

    if (profile.avatarUrl) {
      return (
        <Image
          source={{ uri: profile.avatarUrl }}
          style={isLarge ? styles.avatarLargeImage : styles.avatarSmallImage}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={isLarge ? styles.avatarLarge : styles.avatarSmall}>
        <Text
          style={isLarge ? styles.avatarLargeText : styles.avatarSmallText}
        >
          {getInitial(profile.name)}
        </Text>
      </View>
    );
  }

  const friendStatuses = selectedFriendData?.provinceStatuses ?? {};
  const friendTrips = selectedFriendData?.trips ?? [];

  const visitedCount = Object.values(friendStatuses).filter(
    (status) => status === 'visited' || status === 'home'
  ).length;

  const wishlistCount = Object.values(friendStatuses).filter(
    (status) => status === 'wishlist'
  ).length;

  const totalCount = provinces.length;
  const progress =
    totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;

  const completedChallengesCount = challenges.filter((challenge) =>
    challenge.provinceIds.every((provinceId) => {
      const status = friendStatuses[provinceId];

      return status === 'visited' || status === 'home';
    })
  ).length;  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator color={appColors.white} />
        <Text style={styles.loadingText}>Cargando amigos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchCard}>
        <Text style={styles.sectionTitle}>Buscar usuarios</Text>

        <Text style={styles.sectionSubtitle}>
          Busca a otros viajeros por su nombre.
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Nombre de usuario"
            placeholderTextColor={appColors.textMuted}
            autoCapitalize="words"
            onSubmitEditing={handleSearch}
          />

          <Pressable style={styles.searchButton} onPress={handleSearch}>
            {isSearching ? (
              <ActivityIndicator color={appColors.black} size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </Pressable>
        </View>

        {searchResults.length > 0 ? (
          <View style={styles.listBlock}>
            {searchResults.map((profile) => (
              <View key={profile.id} style={styles.userRow}>
                {renderAvatar(profile, 'small')}

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{profile.name}</Text>
                  <Text style={styles.userSubtitle}>Usuario de SpainApp</Text>
                </View>

                <Pressable
                  style={styles.primarySmallButton}
                  onPress={() => handleSendFriendRequest(profile)}
                  disabled={actionLoadingId === profile.id}
                >
                  {actionLoadingId === profile.id ? (
                    <ActivityIndicator color={appColors.black} size="small" />
                  ) : (
                    <Text style={styles.primarySmallButtonText}>Añadir</Text>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Solicitudes recibidas</Text>
            <Text style={styles.sectionSubtitle}>
              Personas que quieren conectar contigo.
            </Text>
          </View>

          <View style={styles.counterPill}>
            <Text style={styles.counterPillText}>
              {receivedRequests.length}
            </Text>
          </View>
        </View>

        {receivedRequests.length === 0 ? (
          <Text style={styles.emptyText}>No tienes solicitudes pendientes.</Text>
        ) : (
          <View style={styles.listBlock}>
            {receivedRequests.map((request) => {
              const requester = request.requester;

              if (!requester) {
                return null;
              }

              return (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.userRowCompact}>
                    {renderAvatar(requester, 'small')}

                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{requester.name}</Text>
                      <Text style={styles.userSubtitle}>
                        Quiere ser tu amigo
                      </Text>
                    </View>
                  </View>

                  <View style={styles.requestActions}>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => handleRejectRequest(request)}
                      disabled={actionLoadingId === request.id}
                    >
                      <Text style={styles.secondaryButtonText}>Rechazar</Text>
                    </Pressable>

                    <Pressable
                      style={styles.primaryButton}
                      onPress={() => handleAcceptRequest(request)}
                      disabled={actionLoadingId === request.id}
                    >
                      {actionLoadingId === request.id ? (
                        <ActivityIndicator
                          color={appColors.black}
                          size="small"
                        />
                      ) : (
                        <Text style={styles.primaryButtonText}>Aceptar</Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Mis amigos</Text>
            <Text style={styles.sectionSubtitle}>
              Pulsa un amigo para ver su perfil.
            </Text>
          </View>

          <View style={styles.counterPill}>
            <Text style={styles.counterPillText}>{friends.length}</Text>
          </View>
        </View>

        {friends.length === 0 ? (
          <Text style={styles.emptyText}>
            Aún no tienes amigos aceptados.
          </Text>
        ) : (
          <View style={styles.listBlock}>
            {friends.map((friend) => (
              <Pressable
                key={friend.id}
                style={styles.friendRow}
                onPress={() => openFriendProfile(friend)}
              >
                {renderAvatar(friend, 'small')}

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{friend.name}</Text>
                  <Text style={styles.userSubtitle}>Ver perfil viajero</Text>
                </View>

                <Text style={styles.friendArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Solicitudes enviadas</Text>
            <Text style={styles.sectionSubtitle}>
              Usuarios que aún no han respondido.
            </Text>
          </View>

          <View style={styles.counterPill}>
            <Text style={styles.counterPillText}>{sentRequests.length}</Text>
          </View>
        </View>

        {sentRequests.length === 0 ? (
          <Text style={styles.emptyText}>No tienes solicitudes enviadas.</Text>
        ) : (
          <View style={styles.listBlock}>
            {sentRequests.map((request) => {
              const receiver = request.receiver;

              if (!receiver) {
                return null;
              }

              return (
                <View key={request.id} style={styles.userRow}>
                  {renderAvatar(receiver, 'small')}

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{receiver.name}</Text>
                    <Text style={styles.userSubtitle}>Pendiente</Text>
                  </View>

                  <Pressable
                    style={styles.dangerSmallButton}
                    onPress={() => handleCancelSentRequest(request)}
                    disabled={actionLoadingId === request.id}
                  >
                    <Text style={styles.dangerSmallButtonText}>Cancelar</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <Modal
        visible={!!selectedFriend}
        transparent
        animationType="fade"
        onRequestClose={closeFriendProfile}
      >
        <View style={styles.friendProfileOverlay}>
          <View style={styles.friendProfileCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.friendProfileHeader}>
                <View style={styles.friendProfileHeaderLeft}>
                  {selectedFriend ? renderAvatar(selectedFriend, 'large') : null}

                  <View style={styles.friendProfileNameBlock}>
                    <Text style={styles.friendProfileEyebrow}>
                      Perfil de amigo
                    </Text>

                    <Text style={styles.friendProfileName}>
                      {selectedFriend?.name ?? ''}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.friendProfileCloseButton}
                  onPress={closeFriendProfile}
                >
                  <Text style={styles.friendProfileCloseButtonText}>×</Text>
                </Pressable>
              </View>

              {isFriendProfileLoading ? (
                <View style={styles.friendProfileLoading}>
                  <ActivityIndicator color={appColors.white} />
                  <Text style={styles.loadingText}>Cargando perfil...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.friendProgressCard}>
                    <View style={styles.friendProgressHeader}>
                      <View>
                        <Text style={styles.friendProgressNumber}>
                          {progress}%
                        </Text>
                        <Text style={styles.friendProgressLabel}>
                          España completada
                        </Text>
                      </View>

                      <Text style={styles.friendProgressCounter}>
                        {visitedCount} / {totalCount}
                      </Text>
                    </View>

                    <View style={styles.friendProgressBar}>
                      <View
                        style={[
                          styles.friendProgressFill,
                          { width: `${progress}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.friendStatsGrid}>
                    <View style={styles.friendStatCard}>
                      <Text style={styles.friendStatNumber}>
                        {visitedCount}
                      </Text>
                      <Text style={styles.friendStatLabel}>Visitadas</Text>
                    </View>

                    <View style={styles.friendStatCard}>
                      <Text style={styles.friendStatNumber}>
                        {wishlistCount}
                      </Text>
                      <Text style={styles.friendStatLabel}>Quiere ir</Text>
                    </View>

                    <View style={styles.friendStatCard}>
                      <Text style={styles.friendStatNumber}>
                        {friendTrips.length}
                      </Text>
                      <Text style={styles.friendStatLabel}>Viajes</Text>
                    </View>

                    <View style={styles.friendStatCard}>
                      <Text style={styles.friendStatNumber}>
                        {completedChallengesCount}
                      </Text>
                      <Text style={styles.friendStatLabel}>Retos</Text>
                    </View>
                  </View>

                  <View style={styles.friendTripsCard}>
                    <View style={styles.friendTripsHeader}>
                      <Text style={styles.friendTripsTitle}>
                        Últimos viajes
                      </Text>

                      <Text style={styles.friendTripsCounter}>
                        {friendTrips.length}
                      </Text>
                    </View>

                    {friendTrips.length === 0 ? (
                      <Text style={styles.emptyText}>
                        Este amigo aún no tiene viajes guardados.
                      </Text>
                    ) : (
                      <View style={styles.friendTripsList}>
                        {friendTrips.slice(0, 3).map((trip) => (
                          <View key={trip.id} style={styles.friendTripRow}>
                            {trip.imageUri ? (
                              <Image
                                source={{ uri: trip.imageUri }}
                                style={styles.friendTripImage}
                                resizeMode="cover"
                              />
                            ) : (
                              <View style={styles.friendTripImagePlaceholder}>
                                <Text style={styles.friendTripImageIcon}>
                                  ✈️
                                </Text>
                              </View>
                            )}

                            <View style={styles.friendTripInfo}>
                              <Text style={styles.friendTripName}>
                                {trip.name}
                              </Text>

                              <Text style={styles.friendTripDates}>
                                {formatDate(trip.startDate)} -{' '}
                                {formatDate(trip.endDate)}
                              </Text>

                              <Text style={styles.friendTripProvince}>
                                {getProvinceName(trip.provinceId)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
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
  loadingCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: appColors.textSecondary,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  searchCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  sectionSubtitle: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: appColors.text,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  searchButton: {
    backgroundColor: appColors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 82,
  },
  searchButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  messageBox: {
    backgroundColor: appColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 14,
  },
  messageText: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  listBlock: {
    gap: 10,
  },
  userRow: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendRow: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: appColors.surface,
  },
  avatarSmallText: {
    color: appColors.black,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: appColors.surfaceSoft,
  },
  avatarLargeText: {
    color: appColors.black,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  userSubtitle: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: appFonts.main,
  },
  friendArrow: {
    color: appColors.textMuted,
    fontSize: 28,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  primarySmallButton: {
    backgroundColor: appColors.white,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 74,
    alignItems: 'center',
  },
  primarySmallButtonText: {
    color: appColors.black,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  dangerSmallButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dangerSmallButtonText: {
    color: appColors.home,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  requestCard: {
    backgroundColor: appColors.surfaceSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 12,
    gap: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: appColors.white,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  counterPill: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 34,
  },
  counterPillText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  emptyText: {
    color: appColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  friendProfileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  friendProfileCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '88%',
    backgroundColor: appColors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
  },
  friendProfileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  friendProfileHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  friendProfileNameBlock: {
    flex: 1,
  },
  friendProfileEyebrow: {
    color: appColors.textMuted,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
    fontFamily: appFonts.main,
  },
  friendProfileName: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
    fontFamily: appFonts.main,
  },
  friendProfileCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendProfileCloseButtonText: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 25,
    fontFamily: appFonts.main,
  },
  friendProfileLoading: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  friendProgressCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  friendProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  friendProgressNumber: {
    color: appColors.text,
    fontSize: 30,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  friendProgressLabel: {
    color: appColors.textSecondary,
    fontSize: 14,
    fontFamily: appFonts.main,
  },
  friendProgressCounter: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 8,
    fontFamily: appFonts.main,
  },
  friendProgressBar: {
    height: 11,
    backgroundColor: appColors.surface,
    borderRadius: 999,
    overflow: 'hidden',
  },
  friendProgressFill: {
    height: '100%',
    backgroundColor: appColors.white,
    borderRadius: 999,
  },
  friendStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  friendStatCard: {
    width: '47.8%',
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 18,
    padding: 14,
  },
  friendStatNumber: {
    color: appColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  friendStatLabel: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  friendTripsCard: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 20,
    padding: 15,
    gap: 12,
  },
  friendTripsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendTripsTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  friendTripsCounter: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  friendTripsList: {
    gap: 10,
  },
  friendTripRow: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    gap: 10,
  },
  friendTripImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: appColors.surfaceSoft,
  },
  friendTripImagePlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: appColors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendTripImageIcon: {
    fontSize: 22,
  },
  friendTripInfo: {
    flex: 1,
  },
  friendTripName: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  friendTripDates: {
    color: appColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
    fontFamily: appFonts.main,
  },
  friendTripProvince: {
    color: appColors.text,
    fontSize: 12,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});