import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    acceptFriendRequest,
    fetchFriends,
    fetchReceivedFriendRequests,
    fetchSentFriendRequests,
    rejectFriendRequest,
    searchProfiles,
    sendFriendRequest,
    type FriendRequest,
    type PublicProfile,
} from '../lib/friends';
import { appColors, appFonts } from '../theme';

type FriendsScreenProps = {
  userId: string;
};

export default function FriendsScreen({ userId }: FriendsScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<PublicProfile[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function loadFriendsData() {
    try {
      setIsLoading(true);

      const [received, sent, savedFriends] = await Promise.all([
        fetchReceivedFriendRequests(userId),
        fetchSentFriendRequests(userId),
        fetchFriends(userId),
      ]);

      setReceivedRequests(received);
      setSentRequests(sent);
      setFriends(savedFriends);
    } catch (error) {
      console.log('Error loading friends data:', error);
      setMessage('No se pudieron cargar los amigos.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFriendsData();
  }, [userId]);

  async function handleSearch() {
    const cleanSearchText = searchText.trim();

    setMessage('');

    if (cleanSearchText.length < 2) {
      setSearchResults([]);
      setMessage('Escribe al menos 2 letras para buscar.');
      return;
    }

    try {
      setIsSearching(true);

      const results = await searchProfiles(userId, cleanSearchText);

      setSearchResults(results);

      if (results.length === 0) {
        setMessage('No se encontraron usuarios.');
      }
    } catch (error) {
      console.log('Error searching profiles:', error);
      setMessage('No se pudo buscar usuarios.');
    } finally {
      setIsSearching(false);
    }
  }

  function hasPendingSentRequest(profileId: string) {
    return sentRequests.some((request) => request.receiverId === profileId);
  }

  function isAlreadyFriend(profileId: string) {
    return friends.some((friend) => friend.id === profileId);
  }

  async function handleSendFriendRequest(profileId: string) {
    try {
      setActionLoadingId(profileId);
      setMessage('');

      await sendFriendRequest(userId, profileId);
      await loadFriendsData();

      setSearchResults((currentResults) =>
        currentResults.filter((profile) => profile.id !== profileId)
      );

      setMessage('Solicitud enviada.');
    } catch (error) {
      console.log('Error sending friend request:', error);
      setMessage('No se pudo enviar la solicitud.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleAcceptRequest(requestId: string) {
    try {
      setActionLoadingId(requestId);
      setMessage('');

      await acceptFriendRequest(requestId);
      await loadFriendsData();

      setMessage('Solicitud aceptada.');
    } catch (error) {
      console.log('Error accepting friend request:', error);
      setMessage('No se pudo aceptar la solicitud.');
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectRequest(requestId: string) {
    try {
      setActionLoadingId(requestId);
      setMessage('');

      await rejectFriendRequest(requestId);
      await loadFriendsData();

      setMessage('Solicitud rechazada.');
    } catch (error) {
      console.log('Error rejecting friend request:', error);
      setMessage('No se pudo rechazar la solicitud.');
    } finally {
      setActionLoadingId(null);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator color={appColors.white} />
        <Text style={styles.loadingText}>Cargando amigos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.searchCard}>
        <Text style={styles.sectionTitle}>Buscar usuarios</Text>

        <Text style={styles.sectionSubtitle}>
          Busca por nombre y envía solicitudes de amistad.
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por nombre"
            placeholderTextColor={appColors.textMuted}
            autoCapitalize="words"
            editable={!isSearching}
            onSubmitEditing={handleSearch}
          />

          <Pressable
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator color={appColors.black} />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </Pressable>
        </View>

        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        {searchResults.length > 0 ? (
          <View style={styles.resultsList}>
            {searchResults.map((profile) => {
              const alreadyFriend = isAlreadyFriend(profile.id);
              const pending = hasPendingSentRequest(profile.id);
              const isActionLoading = actionLoadingId === profile.id;

              return (
                <View key={profile.id} style={styles.userRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(profile.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {profile.name || 'Usuario'}
                    </Text>

                    <Text style={styles.userSubtitle}>
                      {alreadyFriend
                        ? 'Ya sois amigos'
                        : pending
                          ? 'Solicitud pendiente'
                          : 'Usuario de SpainApp'}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.smallButton,
                      (alreadyFriend || pending) && styles.smallButtonDisabled,
                    ]}
                    onPress={() => handleSendFriendRequest(profile.id)}
                    disabled={alreadyFriend || pending || isActionLoading}
                  >
                    {isActionLoading ? (
                      <ActivityIndicator color={appColors.black} />
                    ) : (
                      <Text style={styles.smallButtonText}>
                        {alreadyFriend ? 'Amigo' : pending ? 'Pendiente' : 'Añadir'}
                      </Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Solicitudes recibidas</Text>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{receivedRequests.length}</Text>
          </View>
        </View>

        {receivedRequests.length === 0 ? (
          <Text style={styles.emptyText}>No tienes solicitudes pendientes.</Text>
        ) : (
          <View style={styles.list}>
            {receivedRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.userRowContent}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(request.requester?.name || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {request.requester?.name || 'Usuario'}
                    </Text>

                    <Text style={styles.userSubtitle}>
                      Quiere añadirte como amigo
                    </Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <Pressable
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(request.id)}
                    disabled={actionLoadingId === request.id}
                  >
                    <Text style={styles.acceptButtonText}>Aceptar</Text>
                  </Pressable>

                  <Pressable
                    style={styles.rejectButton}
                    onPress={() => handleRejectRequest(request.id)}
                    disabled={actionLoadingId === request.id}
                  >
                    <Text style={styles.rejectButtonText}>Rechazar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis amigos</Text>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{friends.length}</Text>
          </View>
        </View>

        {friends.length === 0 ? (
          <Text style={styles.emptyText}>
            Aún no tienes amigos añadidos.
          </Text>
        ) : (
          <View style={styles.list}>
            {friends.map((friend) => (
              <View key={friend.id} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(friend.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {friend.name || 'Usuario'}
                  </Text>

                  <Text style={styles.userSubtitle}>Amigo</Text>
                </View>

                <Text style={styles.arrowText}>›</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Solicitudes enviadas</Text>

          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{sentRequests.length}</Text>
          </View>
        </View>

        {sentRequests.length === 0 ? (
          <Text style={styles.emptyText}>
            No tienes solicitudes enviadas pendientes.
          </Text>
        ) : (
          <View style={styles.list}>
            {sentRequests.map((request) => (
              <View key={request.id} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(request.receiver?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {request.receiver?.name || 'Usuario'}
                  </Text>

                  <Text style={styles.userSubtitle}>Pendiente de aceptar</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
  },
  container: {
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
    gap: 12,
  },
  sectionCard: {
    backgroundColor: appColors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 18,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: appColors.text,
    fontSize: 19,
    fontWeight: '900',
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
    paddingVertical: 13,
    color: appColors.text,
    fontSize: 15,
    fontWeight: '700',
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
  messageText: {
    color: appColors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    fontFamily: appFonts.main,
  },
  resultsList: {
    gap: 10,
  },
  list: {
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
  userRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: appColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: appColors.black,
    fontSize: 18,
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
  smallButton: {
    backgroundColor: appColors.white,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 82,
    alignItems: 'center',
  },
  smallButtonDisabled: {
    opacity: 0.45,
  },
  smallButtonText: {
    color: appColors.black,
    fontSize: 12,
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
  acceptButton: {
    flex: 1,
    backgroundColor: appColors.white,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: appColors.black,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: appColors.home,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: appColors.home,
    fontSize: 14,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  countPill: {
    backgroundColor: appColors.surfaceSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  countPillText: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
  emptyText: {
    color: appColors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: appFonts.main,
  },
  arrowText: {
    color: appColors.textMuted,
    fontSize: 26,
    fontWeight: '900',
    fontFamily: appFonts.main,
  },
});