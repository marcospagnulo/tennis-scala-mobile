import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import GavelRoundedIcon from '@mui/icons-material/GavelRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SportsTennisRoundedIcon from '@mui/icons-material/SportsTennisRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from '@mui/material'
import { Login } from './components/Login'
import { demoLeague } from './data/demoLeague'
import {
  buildGroups,
  evaluateChallenge,
  formatDate,
  formatDateTime,
  formatPoints,
  getRankedPlayers,
  isPlayerEligibleForFinal,
  sortRanking,
} from './domain/rules'
import type { GroupedRanking, MatchOutcome, RankingMode } from './domain/types'
import { auth, firebaseEnabled, missingFirebaseConfig } from './lib/firebase'

const statusLabels = {
  active: 'Attivo',
  justified: 'Giustificato',
  excluded: 'Escluso',
} as const

const outcomeLabels: Record<MatchOutcome, string> = {
  completed: 'Terminata',
  unfinished: 'Non terminata',
  draw: 'Pari',
}

const challengeStatusPalette = {
  valid: 'success',
  warning: 'warning',
  invalid: 'error',
} as const

const scoringRows = [
  ['Partita terminata 2-0', '3 punti al vincitore, 0 al perdente'],
  ['Partita terminata 2-1', '2 punti al vincitore, 1 al perdente'],
  ['Partita non terminata', '1,5 per il primo set, 1 a chi e avanti nel secondo, 0,5 a testa se il secondo e pari'],
  ['Partita pari', '1 punto a chi vince il primo set, 1 punto a chi vince il secondo set'],
  ['Bonus sfidante', '+0,5 punti sempre allo sfidante'],
]

function SummaryCard({
  title,
  value,
  caption,
  icon,
}: {
  title: string
  value: string
  caption: string
  icon: ReactNode
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Typography sx={{ mt: 1 }} variant="h4">
            {value}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
            {caption}
          </Typography>
        </Box>
        <Box
          sx={{
            alignSelf: 'flex-start',
            display: 'grid',
            placeItems: 'center',
            width: 44,
            height: 44,
            borderRadius: 2.5,
            bgcolor: 'primary.50',
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  )
}

function RankingTable({
  ranking,
  groups,
  mode,
}: {
  ranking: ReturnType<typeof sortRanking>
  groups: GroupedRanking[]
  mode: RankingMode
}) {
  const groupLabelByPlayerId = new Map<string, string>()

  groups.forEach((group) => {
    group.players.forEach((player) => {
      groupLabelByPlayerId.set(player.id, group.label)
    })
  })

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Giocatore</TableCell>
            <TableCell>Gruppo reale</TableCell>
            <TableCell align="right">{mode === 'real' ? 'Punti reali' : 'Punti live'}</TableCell>
            <TableCell align="right">Punti periodo</TableCell>
            <TableCell align="right">Partite periodo</TableCell>
            <TableCell align="right">Partite totali</TableCell>
            <TableCell>Stato</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ranking.map((player, index) => (
            <TableRow key={player.id} hover>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography sx={{ fontWeight: 600 }} variant="body2">
                    {player.name}
                  </Typography>
                  {player.notes ? (
                    <Typography color="text.secondary" variant="caption">
                      {player.notes}
                    </Typography>
                  ) : null}
                </Stack>
              </TableCell>
              <TableCell>{groupLabelByPlayerId.get(player.id)}</TableCell>
              <TableCell align="right">
                {formatPoints(mode === 'real' ? player.realPoints : player.livePoints)}
              </TableCell>
              <TableCell align="right">{formatPoints(player.currentPeriodPoints)}</TableCell>
              <TableCell align="right">{player.currentPeriodMatches}</TableCell>
              <TableCell align="right">{player.totalMatches}</TableCell>
              <TableCell>
                <Chip
                  color={
                    player.status === 'active'
                      ? 'success'
                      : player.status === 'justified'
                        ? 'warning'
                        : 'error'
                  }
                  label={statusLabels[player.status]}
                  size="small"
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankingMode, setRankingMode] = useState<RankingMode>('real')

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const currentPeriod = demoLeague.periods.find((period) => period.isCurrent) ?? demoLeague.periods[0]
  const rankedPlayers = useMemo(
    () => getRankedPlayers(demoLeague.players, demoLeague.matches),
    [],
  )
  const realRanking = useMemo(() => sortRanking(rankedPlayers, 'real'), [rankedPlayers])
  const liveRanking = useMemo(() => sortRanking(rankedPlayers, 'live'), [rankedPlayers])
  const realGroups = useMemo(
    () => buildGroups(rankedPlayers, 'real', demoLeague.rules.targetGroupSize),
    [rankedPlayers],
  )
  const challengeChecks = useMemo(
    () =>
      demoLeague.challenges.map((challenge) =>
        evaluateChallenge(challenge, demoLeague.players, demoLeague.matches, demoLeague.rules),
      ),
    [],
  )
  const playerById = useMemo(
    () => new Map(rankedPlayers.map((player) => [player.id, player])),
    [rankedPlayers],
  )
  const invalidChallenges = challengeChecks.filter((entry) => entry.status === 'invalid').length
  const eligiblePlayers = rankedPlayers.filter((player) =>
    isPlayerEligibleForFinal(player, demoLeague.rules),
  )
  const playersNeedingActivity = rankedPlayers.filter(
    (player) => player.status === 'active' && player.currentPeriodMatches < demoLeague.rules.minimumMatchesPerPeriod,
  )
  const nonActivePlayers = rankedPlayers.filter((player) => player.status !== 'active')

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
    }
  }

  if (loading) {
    return <Typography sx={{ p: 4 }}>Caricamento in corso...</Typography>
  }

  if (!user) {
    return <Login />
  }

  return (
    <Box sx={{ bgcolor: '#f4f6fb', minHeight: '100vh' }}>
      <AppBar color="transparent" elevation={0} position="static" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
          <SportsTennisRoundedIcon color="primary" />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{demoLeague.name}</Typography>
            <Typography color="text.secondary" variant="body2">
              Dashboard amministrativa aderente al regolamento PDF
            </Typography>
          </Box>
          <Chip color="primary" label={`Stagione ${demoLeague.season}`} variant="outlined" />
          <Button onClick={handleLogout} variant="outlined" color="secondary">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              background:
                'linear-gradient(135deg, rgba(21,101,192,0.08), rgba(25,118,210,0.02) 55%, rgba(255,255,255,0.95))',
            }}
          >
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography variant="h4">Scala mobile, periodi da 3 settimane e gruppi dinamici</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 900 }} variant="body1">
                    L'app usa i gruppi della classifica reale, aggiorna la classifica live a ogni risultato,
                    applica il punteggio ufficiale del PDF e gestisce sfide standard, sfide irrevocabili,
                    partite non terminate, esclusioni e accesso al tabellone finale.
                  </Typography>
                </Box>
                <Chip
                  color="secondary"
                  icon={<TimelineRoundedIcon />}
                  label={`${currentPeriod.label} · ${formatDate(currentPeriod.startDate)} - ${formatDate(currentPeriod.endDate)}`}
                  sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                />
              </Stack>

              <Alert
                icon={<CloudDoneRoundedIcon fontSize="inherit" />}
                severity={firebaseEnabled ? 'success' : 'info'}
                variant="outlined"
              >
                {firebaseEnabled
                  ? 'Firebase e configurato: i riferimenti Firestore sono pronti per persistere giocatori, partite, sfide e esclusioni.'
                  : `Firebase non e ancora configurato. Mancano: ${missingFirebaseConfig.join(', ')}.`}
              </Alert>
            </Stack>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            <SummaryCard
              title="Gruppi reali"
              value={String(realGroups.length)}
              caption={`Target ${demoLeague.rules.targetGroupSize} giocatori, confine dinamico di ${demoLeague.rules.adjacentBoundarySize} giocatori`}
              icon={<GroupsRoundedIcon />}
            />
            <SummaryCard
              title="Partite registrate"
              value={String(demoLeague.matches.length)}
              caption="La classifica live usa subito i punti del periodo corrente"
              icon={<SportsTennisRoundedIcon />}
            />
            <SummaryCard
              title="Accessi fase finale"
              value={String(eligiblePlayers.length)}
              caption={`Servono almeno ${demoLeague.rules.minimumMatchesForFinalStage} incontri totali`}
              icon={<EmojiEventsRoundedIcon />}
            />
            <SummaryCard
              title="Sfide da correggere"
              value={String(invalidChallenges)}
              caption="Vincoli su gruppi, ripetizioni, stato giocatore e sfida irrevocabile"
              icon={<WarningAmberRoundedIcon />}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 1.7fr) minmax(360px, 1fr)',
              },
            }}
          >
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box sx={{ px: 3, pt: 2.5 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography variant="h6">Classifiche</Typography>
                    <Typography color="text.secondary" variant="body2">
                      I gruppi e i limiti di sfida si basano sempre sulla classifica reale.
                    </Typography>
                  </Box>
                  <Tabs
                    onChange={(_, nextMode: RankingMode) => setRankingMode(nextMode)}
                    value={rankingMode}
                  >
                    <Tab label="Classifica reale" value="real" />
                    <Tab label="Classifica live" value="live" />
                  </Tabs>
                </Stack>
              </Box>
              <Divider sx={{ mt: 2 }} />
              <RankingTable
                groups={realGroups}
                mode={rankingMode}
                ranking={rankingMode === 'real' ? realRanking : liveRanking}
              />
            </Paper>

            <Stack spacing={3}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
                <Stack direction="row" spacing={1.5}>
                  <GavelRoundedIcon color="primary" />
                  <Box>
                    <Typography variant="h6">Regole operative implementate</Typography>
                    <Typography color="text.secondary" variant="body2">
                      Le differenze rispetto alla vecchia analisi sono gia applicate nel modello.
                    </Typography>
                  </Box>
                </Stack>
                <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                  <Chip label="Periodi di 3 settimane" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label="Gruppi dinamici basati sulla classifica reale" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label="Classifica live aggiornata a ogni risultato" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label="Sfide tra stesso gruppo o giocatori di confine tra gruppi adiacenti" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label="Sfida irrevocabile con controllo prenotazioni e giorni di riposo" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Chip label="Esclusioni per inattivita o rifiuto di sfide irrevocabili" size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6">Matrice punteggi</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Il punteggio a set della versione precedente e stato sostituito con quello del PDF.
                  </Typography>
                </Box>
                <Divider />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell>Assegnazione punti</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {scoringRows.map(([scenario, description]) => (
                        <TableRow key={scenario}>
                          <TableCell>{scenario}</TableCell>
                          <TableCell>{description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Stack>
          </Box>

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">Sfide correnti e controlli di validita</Typography>
              <Typography color="text.secondary" variant="body2">
                Il controllo usa gruppi reali, ripetizioni nel periodo, prima sfida del periodo, disponibilita e vincoli della sfida irrevocabile.
              </Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Sfida</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Campo</TableCell>
                    <TableCell>Esito controllo</TableCell>
                    <TableCell>Motivazioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {challengeChecks.map(({ challenge, status, reasons }) => {
                    const challenger = playerById.get(challenge.challengerId)
                    const opponent = playerById.get(challenge.opponentId)

                    return (
                      <TableRow key={challenge.id} hover>
                        <TableCell>{formatDateTime(challenge.scheduledAt)}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }} variant="body2">
                            {challenger?.name} sfida {opponent?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={challenge.type === 'irrevocable' ? 'secondary' : 'default'}
                            label={challenge.type === 'irrevocable' ? 'Irrevocabile' : 'Standard'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{challenge.location}</TableCell>
                        <TableCell>
                          <Chip
                            color={challengeStatusPalette[status]}
                            label={status === 'valid' ? 'Valida' : status === 'warning' ? 'Parziale' : 'Non valida'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {reasons.map((reason) => (
                              <Typography key={reason} color="text.secondary" variant="caption">
                                • {reason}
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">Risultati del periodo e classifica live</Typography>
              <Typography color="text.secondary" variant="body2">
                Le partite non terminate usano la logica ufficiale del PDF e i bonus allo sfidante sono gia inclusi nei punti assegnati.
              </Typography>
            </Box>
            <Divider />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Incontro</TableCell>
                    <TableCell>Esito</TableCell>
                    <TableCell>Set / games</TableCell>
                    <TableCell>Punti assegnati</TableCell>
                    <TableCell>Nota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {demoLeague.matches.map((match) => {
                    const homePlayer = playerById.get(match.homePlayerId)
                    const awayPlayer = playerById.get(match.awayPlayerId)

                    return (
                      <TableRow key={match.id} hover>
                        <TableCell>{formatDateTime(match.playedAt)}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600 }} variant="body2">
                            {homePlayer?.name} vs {awayPlayer?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            color={
                              match.outcome === 'completed'
                                ? 'success'
                                : match.outcome === 'draw'
                                  ? 'warning'
                                  : 'info'
                            }
                            label={outcomeLabels[match.outcome]}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {match.sets.map((set, index) => (
                              <Typography key={`${match.id}-${index}`} variant="caption">
                                Set {index + 1}: {set.homeGames}-{set.awayGames}
                                {set.note ? ` · ${set.note}` : ''}
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            {Object.entries(match.pointsAwarded).map(([playerId, points]) => (
                              <Typography key={playerId} variant="caption">
                                {playerById.get(playerId)?.name}: {formatPoints(points)}
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>{match.summary}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
              },
            }}
          >
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Stati, esclusioni e obblighi del periodo</Typography>
                <Typography color="text.secondary" variant="body2">
                  Il regolamento usa esclusioni e giustificazioni; il congelamento non e piu il flusso principale.
                </Typography>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Giocatore</TableCell>
                      <TableCell>Stato</TableCell>
                      <TableCell>Partite periodo</TableCell>
                      <TableCell>Rifiuti irrevocabili</TableCell>
                      <TableCell>Note</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...nonActivePlayers, ...playersNeedingActivity].map((player) => (
                      <TableRow key={player.id} hover>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>
                          <Chip
                            color={
                              player.status === 'excluded'
                                ? 'error'
                                : player.status === 'justified'
                                  ? 'warning'
                                  : 'info'
                            }
                            label={statusLabels[player.status]}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{player.currentPeriodMatches}</TableCell>
                        <TableCell>
                          {player.irrevocableRefusalsCurrentPeriod} nel periodo / {player.irrevocableRefusalsTotal} totali
                        </TableCell>
                        <TableCell>{player.notes ?? 'Deve ancora disputare almeno una partita nel periodo.'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6">Accesso al tabellone finale</Typography>
                <Typography color="text.secondary" variant="body2">
                  La fase finale e a eliminazione diretta e usa la classifica maturata alla fine dell'ultimo periodo.
                </Typography>
              </Box>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Giocatore</TableCell>
                      <TableCell align="right">Partite totali</TableCell>
                      <TableCell align="right">Punti live</TableCell>
                      <TableCell>Idoneita</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {liveRanking.map((player) => {
                      const eligible = isPlayerEligibleForFinal(player, demoLeague.rules)

                      return (
                        <TableRow key={player.id} hover>
                          <TableCell>{player.name}</TableCell>
                          <TableCell align="right">{player.totalMatches}</TableCell>
                          <TableCell align="right">{formatPoints(player.livePoints)}</TableCell>
                          <TableCell>
                            <Chip
                              color={eligible ? 'success' : 'default'}
                              label={eligible ? 'Ammesso' : 'Non ammesso'}
                              size="small"
                              variant={eligible ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
