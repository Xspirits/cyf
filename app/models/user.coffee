# load the things we need
mongoose = require("mongoose")
bcrypt = require("bcrypt-nodejs")

# define the schema for our user model
userSchema = mongoose.Schema(
  verfiy_hash:
    type: String
    required: true
  icon : String
  verified:
    type: Boolean
    default: false
  idCool:
    type: String
    index: true

  userRand:
    lat: Number
    lng: Number

  isOnline:
    type: Boolean
    default: false

  level:
    type: Number
    default: 1

  xpDouble:
    type: Boolean
    default: false

  xp:
    type: Number
    default: 0
  xpHistoric: [
    xp:
      type: Number
      default: 0
    level:
      type: Number
      default: 0
    date:
      type: Date
      default: Date.now
  ]
  xpNext:
    type: Number
    default: 100

  dailyRank:
    type: Number
    default: 0

  dailyScore:
    type: Number
    default: 0

  daily:
    xp:
      type: Number
      default: 0

    level:
      type: Number
      default: 0

    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

  dailyArchives: [
    rank:
      type: Number
      default: 0

    xp:
      type: Number
      default: 0

    level:
      type: Number
      default: 0

    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

    date:
      type: Date
      default: Date.now
  ]
  weeklyRank:
    type: Number
    default: 0

  weeklyScore:
    type: Number
    default: 0

  weekly:
    xp:
      type: Number
      default: 0

    level:
      type: Number
      default: 0

    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

  weeklyArchives: [
    rank:
      type: Number
      default: 0

    xp:
      type: Number
      default: 0

    level:
      type: Number
      default: 0

    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

    week:
      type: Date
      default: Date.now
  ]
  monthlyRank:
    type: Number
    default: 0

  monthlyScore:
    type: Number
    default: 0

  monthly:
    xp:
      type: Number
      default: 0

    level:
      type: Number
      default: 0

    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

  monthlyArchives: [
    rank:
      type: Number
      default: 0

    xp:
      type: Number
      default: 0

    level:
      type: Number
      default: 0

    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

    month:
      type: Date
      default: Date.now
  ]
  globalScore:
    type: Number
    default: 0

  global:
    shareFB:
      type: Number
      default: 0

    shareTW:
      type: Number
      default: 0

  share:
    facebook:
      type: Boolean
      default: true

    twitter:
      type: Boolean
      default: true

  local:
    email: String
    password: String
    pseudo: String
    joinDate:
      type: Date
      default: Date.now

  leagueoflegend:
    confirmed: 
      type:Boolean
      default: false
    idProfile: Number
    name: String
    region: String
    profileIconId: Number
    profileIconId_confirm: 
      type: Number
      default: 0
    revisionDate: Date
    summonerLevel: Number
    lastUpdated:
      type: Date
      default: Date.now
    linkedOnce:
      type: Boolean
      default: true
    lastGames:[
      championId: Number   #int Champion ID associated with game.
      createDate: String    #long  Date that end game data was recorded, specified as epoch milliseconds.
      championInfos:
        id:Number,
        title:String
        name:String
        key:String
      fellowPlayers: [
        championId: Number
        summonerId: Number
        teamId: Number
      ]    #[PlayerDto] Other players associated with the game.
      gameId: Number    #long  Game ID.
      gameMode: String    #string  Game mode. (legal values: CLASSIC, ODIN, ARAM, TUTORIAL, ONEFORALL, FIRSTBLOOD)
      gameType: String    #string  Game type. (legal values: CUSTOM_GAME, MATCHED_GAME, TUTORIAL_GAME)
      invalid: Boolean     # Invalid flag.
      ipEarned: Number    #int IP Earned.
      level: Number     # Level.
      mapId: Number     # Map ID.
      spell1: Number    #int ID of first summoner spell.
      spell2: Number    #int ID of second summoner spell.
      stats: # Statistics associated with the game for this summoner.
        assists: Number     #int 
        barracksKilled: Number      # int num of enemy inhibitors killed.
        championsKilled: Number     #int 
        combatPlayerScore: Number     #int 
        consumablesPurchased: Number      # int 
        damageDealtPlayer: Number     #int 
        doubleKills: Number     #int 
        firstBlood: Number      # int 
        gold: Number      # int 
        goldEarned: Number      # int 
        goldSpent: Number     #int 
        item0: Number     #int 
        item1: Number     #int 
        item2: Number     #int 
        item3: Number     #int 
        item4: Number     #int 
        item5: Number     #int 
        item6: Number     #int 
        itemsPurchased: Number      # int 
        killingSprees: Number     #int 
        largestCriticalStrike: Number     #int 
        largestKillingSpree: Number     #int 
        largestMultiKill: Number      # int 
        legendaryItemsCreated: Number     #int num of tier 3 items built.
        level: Number     #int 
        magicDamageDealtPlayer: Number      # int 
        magicDamageDealtToChampions: Number     #int 
        magicDamageTaken: Number      # int 
        minionsDenied: Number     #int 
        minionsKilled: Number     #int 
        neutralMinionsKilled: Number      # int 
        neutralMinionsKilledEnemyJungle: Number     #int 
        neutralMinionsKilledYourJungle: Number      # int 
        nexusKilled: Number     #boolean Flag specifying if the summoner got the killing blow on the nexus.
        nodeCapture: Number     #int 
        nodeCaptureAssist: Number     #int 
        nodeNeutralize: Number      # int 
        nodeNeutralizeAssist: Number      # int 
        numDeaths: Number     #int 
        numItemsBought: Number      # int 
        objectivePlayerScore: Number      # int 
        pentaKills: Number      # int 
        physicalDamageDealtPlayer: Number     #int 
        physicalDamageDealtToChampions: Number      # int 
        physicalDamageTaken: Number     #int 
        quadraKills: Number     #int 
        sightWardsBought: Number      # int 
        spell1Cast: Number      # int Number of times first champion spell was cast.
        spell2Cast: Number      # int Number of times second champion spell was cast.
        spell3Cast: Number      # int Number of times third champion spell was cast.
        spell4Cast: Number      # int Number of times fourth champion spell was cast.
        summonSpell1Cast: Number      # int 
        summonSpell2Cast: Number      # int 
        superMonsterKilled: Number      # int 
        team: Number      # int 
        teamObjective: Number     #int 
        timePlayed: Number      # int 
        totalDamageDealt: Number      # int 
        totalDamageDealtToChampions: Number     #int 
        totalDamageTaken: Number      # int 
        totalHeal: Number     #int 
        totalPlayerScore: Number      # int 
        totalScoreRank: Number      # int 
        totalTimeCrowdControlDealt: Number      # int 
        totalUnitsHealed: Number      # int 
        tripleKills: Number     #int 
        trueDamageDealtPlayer: Number     #int 
        trueDamageDealtToChampions: Number      # int 
        trueDamageTaken: Number     #int 
        turretsKilled: Number     #int 
        unrealKills: Number     #int 
        victoryPointTotal: Number     #int 
        visionWardsBought: Number     #int 
        wardKilled: Number      # int 
        wardPlaced: Number      # int 
        win: Boolean     #boolean Flag specifying whether or not this game was won.
      subType: String     #  Game sub-type. (legal values: NONE, NORMAL, BOT, RANKED_SOLO_5x5, RANKED_PREMADE_3x3, RANKED_PREMADE_5x5, ODIN_UNRANKED, RANKED_TEAM_3x3, RANKED_TEAM_5x5, NORMAL_3x3, BOT_3x3, CAP_5x5, ARAM_UNRANKED_5x5, ONEFORALL_5x5, FIRSTBLOOD_1x1, FIRSTBLOOD_2x2, SR_6x6, URF, URF_BOT)
      teamId: Number    #int Team ID associated with game. Team ID 100 is blue team. Team ID 200 is purple team.
    ]
  fbInvitedFriends:[Number]
  facebook:
    id: String
    token: String
    email: String
    name: String

  twitter:
    id: String
    token: String
    tokenSecret: String
    displayName: String
    username: String

  google:
    id: String
    token: String
    email: String
    name: String

  notifications: [
    idFrom:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "User"

    icon:
      type: String
      default: "fa fa-bell"

    from:
      type: String
      default: ""

    to:
      type: String
      default: ""

    title:
      type: String
      default: ""

    date:
      type: Date
      default: Date.now

    message:
      type: String
      default: ""

    link1:
      type: String
      default: ""

    link2:
      type: String
      default: ""

    notificationType:
      type: String
      default: "info"

    persist:
      type: Boolean
      default: false

    type:
      type: String
      default: "simple"

    isSeen:
      type: Boolean
      default: false
  ]
  games: [
    idGame:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "Game"

    idCool: String
    date:
      type: Date
      default: Date.now

    favorite: 
      type: Boolean
      default: false
  ]
  friends: [
    idUser:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "User"

    idCool: String
    date:
      type: Date
      default: Date.now

    userName: String
  ]
  sentRequests: [
    idUser:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "User"

    idCool: String
    date:
      type: Date
      default: Date.now

    userName: String
  ]
  pendingRequests: [
    idUser:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "User"

    idCool: String
    date:
      type: Date
      default: Date.now

    userName: String
  ]
  followers: [
    idUser:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "User"

    idCool: String
    date:
      type: Date
      default: Date.now

    userName: String
  ]
  tribunal: [
    type: mongoose.Schema.Types.ObjectId
    index: true
    ref: "Ongoing"
  ]
  tribunalHistoric: [
    idCase:
      type: mongoose.Schema.Types.ObjectId
      ref: "Ongoing"

    answer:
      type: Boolean
      default: false

    voteDate: Date
  ]
  challengeCompleted: [
    type: mongoose.Schema.Types.ObjectId
    ref: "Challenge"
  ]
  challengeRate: [
    type: mongoose.Schema.Types.ObjectId
    index: true
    ref: "Challenge"
  ]
  challengeRateHistoric: [
    _idChallenge:
      type: mongoose.Schema.Types.ObjectId
      index: true
      ref: "Challenge"

    rateDate: Date
    rating:
      difficulty: Number
      quickness: Number
      fun: Number
  ]
)

# generating a hash
userSchema.methods.generateHash = (password) ->
  bcrypt.hashSync password, bcrypt.genSaltSync(8), null


# checking if password is valid
userSchema.methods.validPassword = (password) ->
  bcrypt.compareSync password, @local.password

userSchema.index userRand: "2d"

# create the model for users and expose it to our app
module.exports = mongoose.model("User", userSchema)