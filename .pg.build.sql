CREATE TABLE Languages (
    name        VARCHAR(10) PRIMARY KEY
);

CREATE TABLE PokemonGeneration (
    gid         SERIAL PRIMARY KEY,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PokemonGenerationDetail (
    gdid        SERIAL PRIMARY KEY,
    gid         INTEGER NOT NULL REFERENCES PokemonGeneration(gid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(20) NOT NULL,

    UNIQUE(gid, language)
);

CREATE INDEX idx_pokemongenerationdetail_gid_language ON PokemonGenerationDetail(gid, language);

CREATE TABLE PokemonVersionGroup (
    vgid        SERIAL PRIMARY KEY,
    gid         INTEGER NOT NULL REFERENCES PokemonGeneration(gid),
    brief       VARCHAR(40) NOT NULL UNIQUE
);

CREATE INDEX idx_pokemonversiongroup_gid ON PokemonVersionGroup(gid);

CREATE TABLE PokemonVersionGroupDetail (
    vgdid       SERIAL PRIMARY KEY,
    vgid        INTEGER NOT NULL REFERENCES PokemonVersionGroup(vgid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(60) NOT NULL,

    UNIQUE(vgid, language)
);

CREATE INDEX idx_pokemonversiongroupdetail_vgid_language ON PokemonVersionGroupDetail(vgid, language);

CREATE TABLE PokemonVersion (
    vid         SERIAL PRIMARY KEY,
    vgid        INTEGER NOT NULL REFERENCES PokemonVersionGroup(vgid),
    brief       VARCHAR(30) NOT NULL UNIQUE
);

CREATE INDEX idx_pokemonversion_vgid ON PokemonVersion(vgid);

CREATE TABLE PokemonVersionDetail (
    vdid        SERIAL PRIMARY KEY,
    vid         INTEGER NOT NULL REFERENCES PokemonVersion(vid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(40) NOT NULL,

    UNIQUE(vid, language)
);

CREATE INDEX idx_pokemonversiondetail_vid_language ON PokemonVersionDetail(vid, language);

CREATE TABLE PokemonType (
    tid         SMALLSERIAL PRIMARY KEY,
    brief       VARCHAR(20) NOT NULL UNIQUE,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PokemonTypeRelation (
    tlid        SERIAL PRIMARY KEY,
    tid         SMALLINT NOT NULL REFERENCES PokemonType(tid),
    toTid       SMALLINT NOT NULL REFERENCES PokemonType(tid),
    relation    VARCHAR(20) NOT NULL,

    UNIQUE(tid, toTid, relation)
);

CREATE INDEX idx_pokemontyperelation_tid_relation ON PokemonTypeRelation(tid, relation);
CREATE INDEX idx_pokemontyperelation_tid_toTid ON PokemonTypeRelation(tid, toTid);

CREATE TABLE PokemonTypeDetail (
    tdid        SERIAL PRIMARY KEY,
    tid         SMALLINT NOT NULL REFERENCES PokemonType(tid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(20) NOT NULL,

    UNIQUE(tid, language)
);

CREATE INDEX idx_pokemontypedetail_tid_language ON PokemonTypeDetail(tid, language);

CREATE TABLE PokemonEvolutionChain (
    ecid        SERIAL PRIMARY KEY,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PokemonEvolution (     
    eid         SERIAL PRIMARY KEY,
    ecid        INTEGER NOT NULL REFERENCES PokemonEvolutionChain(ecid),
    sid         INTEGER NOT NULL REFERENCES PokemonSpecie(sid),
    toSid       INTEGER NOT NULL REFERENCES PokemonSpecie(sid),
    
    UNIQUE(sid, toSid)
);

CREATE INDEX idx_pokemonevolution_ecid ON PokemonEvolution(ecid);
CREATE INDEX idx_pokemonevolution_sid ON PokemonEvolution(sid);
CREATE INDEX idx_pokemonevolution_toSid ON PokemonEvolution(toSid);

CREATE TABLE PokemonGenus (
    gid         SERIAL PRIMARY KEY,
    brief       VARCHAR(30) NOT NULL UNIQUE
);

CREATE INDEX idx_pokemongenus_brief ON PokemonGenus(brief);

CREATE TABLE PokemonGenusDetail (
    gdid        SERIAL PRIMARY KEY,
    gid         INTEGER NOT NULL REFERENCES PokemonGenus(gid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(40) NOT NULL,
    
    UNIQUE(gid, language)
);

CREATE INDEX idx_pokemongenusdetail_gid_language ON PokemonGenusDetail(gid, language);

CREATE TABLE PokemonColor (
    cid         SERIAL PRIMARY KEY,
    brief       VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE PokemonColorDetail (
    cdid        SERIAL PRIMARY KEY,
    cid         INTEGER NOT NULL REFERENCES PokemonColor(cid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(20) NOT NULL,

    UNIQUE(cid, language)
);

CREATE INDEX idx_pokemoncolordetail_cid_language ON PokemonColorDetail(cid, language);

<<<<
CREATE TABLE PokemonSpecie (
    sid         SERIAL PRIMARY KEY,
    ecid        INTEGER NOT NULL REFERENCES PokemonEvolutionChain(ecid),
    gid         INTEGER NOT NULL REFERENCES PokemonGenus(gid),
    cid         INTEGER NOT NULL REFERENCES PokemonColor(cid),
    generation  INTEGER NOT NULL REFERENCES PokemonGeneration(gid),
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pokemonspecie_ecid ON PokemonSpecie(ecid);
CREATE INDEX idx_pokemonspecie_generation ON PokemonSpecie(generation);

CREATE TABLE PokemonSpecieDetail (
    sdid        SERIAL PRIMARY KEY,
    sid         INTEGER NOT NULL REFERENCES PokemonSpecie(sid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(40) NOT NULL,

    UNIQUE(sid, language)
);

CREATE INDEX idx_pokemonspeciedetail_sid_language ON PokemonSpecieDetail(sid, language);

CREATE TABLE PokemonSpecieText (
    stid        SERIAL PRIMARY KEY,
    sid         INTEGER NOT NULL REFERENCES PokemonSpecie(sid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    flavorText  VARCHAR(256) NOT NULL,

    UNIQUE(sid, language, flavorText)
);

CREATE INDEX idx_pokemonspecietext_sid_language ON PokemonSpecieText(sid, language);

CREATE TABLE Pokemon (
    pid         SERIAL PRIMARY KEY,
    sid         INTEGER NOT NULL REFERENCES PokemonSpecie(sid),
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PokemonDetail (
    did         SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(40) NOT NULL,

    UNIQUE(pid, language)
);

CREATE INDEX idx_pokemondetail_pid_language ON PokemonDetail(pid, language);

CREATE TABLE PokemonTypeLink (
    tlid        SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    tid         SMALLINT NOT NULL REFERENCES PokemonType(tid),

    UNIQUE(pid, tid)
);

CREATE INDEX idx_pokemontypelink_pid ON PokemonTypeLink(pid);

CREATE TABLE PokemonImageType (
    itid        SMALLSERIAL PRIMARY KEY,
    brief       VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE PokemonImage (
    iid         SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    itid        SMALLINT NOT NULL REFERENCES PokemonImageType(itid),
    url         VARCHAR(256) UNIQUE
);

CREATE INDEX idx_pokemonimage_pid ON PokemonImage(pid);
CREATE INDEX idx_pokemonimage_pid_itid ON PokemonImage(pid, itid);

CREATE TABLE PokemonMoveClass (
    mcid        SMALLSERIAL PRIMARY KEY,
    brief       VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE PokemonMoveClassDetail (
    mcdid       SERIAL PRIMARY KEY,
    mcid        SMALLINT NOT NULL REFERENCES PokemonMoveClass(mcid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    description VARCHAR(100) NOT NULL,

    UNIQUE(mcid, language)
);

CREATE INDEX idx_pokemonmoveclassdetail_mcid_language ON PokemonMoveClassDetail(mcid, language);

CREATE TABLE PokemonMove (
    mid         SERIAL PRIMARY KEY,
    tid         SMALLINT NOT NULL REFERENCES PokemonType(tid),
    mcid        SMALLINT NOT NULL REFERENCES PokemonMoveClass(mcid),
    generation  INTEGER NOT NULL REFERENCES PokemonGeneration(gid),
    power       INTEGER NOT NULL,
    pp          INTEGER NOT NULL,
    priority    INTEGER NOT NULL,
    accuracy    INTEGER NOT NULL,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PokemonMoveDetail (
    mdid        SERIAL PRIMARY KEY,
    mid         INTEGER NOT NULL REFERENCES PokemonMove(mid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(256),

    UNIQUE(mid, language)
);

CREATE INDEX idx_pokemonmovedetail_mid_language ON PokemonMoveDetail(mid, language);

CREATE TABLE PokemonMoveLink (
    mlid        SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    mid         INTEGER NOT NULL REFERENCES PokemonMove(mid),
    level       INTEGER NOT NULL,

    UNIQUE(pid, mid)
);

CREATE INDEX idx_pokemonmovelink_pid ON PokemonMoveLink(pid);

CREATE TABLE PokemonCrieType (
    ctid_       SMALLSERIAL PRIMARY KEY,
    brief       VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE PokemonCrie (
    cid         SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    ctid_       SMALLINT NOT NULL REFERENCES PokemonCrieType(ctid_),
    url         VARCHAR(256),

    UNIQUE(pid, ctid_)
);

CREATE INDEX idx_pokemoncrie_pid_ctid_ ON PokemonCrie(pid, ctid_);

CREATE TABLE PokemonStatType (
    stid        SMALLSERIAL PRIMARY KEY,
    brief       VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE PokemonStatTypeDetail (
    stdid       SERIAL PRIMARY KEY,
    stid        SMALLINT NOT NULL REFERENCES PokemonStatType(stid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(50) NOT NULL,

    UNIQUE(stid, language)
);

CREATE INDEX idx_pokemonstattypedetail_stid_language ON PokemonStatTypeDetail(stid, language);

CREATE TABLE PokemonStat (
    sid         SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    stid        SMALLINT NOT NULL REFERENCES PokemonStatType(stid),
    baseStat    SMALLINT NOT NULL,
    effort      SMALLINT NOT NULL,

    UNIQUE(pid, stid)
);

CREATE INDEX idx_pokemonstat_pid_stid ON PokemonStat(pid, stid);
CREATE INDEX idx_pokemonstat_pid_effort ON PokemonStat(pid, effort);

CREATE TABLE PokemonBase (
    bid         SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL UNIQUE REFERENCES Pokemon(pid),
    height      SMALLINT NOT NULL,
    weight      SMALLINT NOT NULL,
    experience  SMALLINT NOT NULL
);

CREATE INDEX idx_pokemonbase_pid ON PokemonBase(pid);

CREATE TABLE PokemonAbility (
    aid         SERIAL PRIMARY KEY,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PokemonAbilityDetail (
    adid        SERIAL PRIMARY KEY,
    aid         INTEGER NOT NULL REFERENCES PokemonAbility(aid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(256),

    UNIQUE(aid, language)
);

CREATE INDEX idx_pokemonabilitydetail_aid_language ON PokemonAbilityDetail(aid, language);

CREATE TABLE PokemonAbilityLink (
    alid        SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    aid         INTEGER NOT NULL REFERENCES PokemonAbility(aid),

    UNIQUE(pid, aid)
);

CREATE INDEX idx_pokemonabilitylink_pid ON PokemonAbilityLink(pid);

CREATE TABLE PokemonItemPocket (
    ipid        SERIAL PRIMARY KEY,
    brief       VARCHAR(10) NOT NULL UNIQUE,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP   
);

CREATE TABLE PokemonItemPocketDetail (
    ipdid       SERIAL PRIMARY KEY,
    ipid        INTEGER NOT NULL REFERENCES PokemonItemPocket(ipid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(50) NOT NULL,

    UNIQUE(ipid, language)
);

CREATE INDEX idx_pokemonitempocketdetail_ipid_language ON PokemonItemPocketDetail(ipid, language);

CREATE TABLE PokemonItem (
    iid         SERIAL PRIMARY KEY,
    ipid        INTEGER NOT NULL REFERENCES PokemonItemPocket(ipid),
    cost        INTEGER NOT NULL,
    url         VARCHAR(256) NOT NULL
);

CREATE INDEX idx_pokemonitem_ipid ON PokemonItem(ipid);

CREATE TABLE PokemonItemDetail (
    idid        SERIAL PRIMARY KEY,
    iid         INTEGER NOT NULL REFERENCES PokemonItem(iid),
    language    VARCHAR(10) NOT NULL REFERENCES Languages(name),
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(256),

    UNIQUE(iid, language)
);

CREATE INDEX idx_pokemonitemdetail_iid_language ON PokemonItemDetail(iid, language);

CREATE TABLE PokemonItemLink (
    ilid        SERIAL PRIMARY KEY,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    iid         INTEGER NOT NULL REFERENCES PokemonItem(iid),

    UNIQUE(pid, iid)
);

CREATE INDEX idx_pokemonitemlink_pid ON PokemonItemLink(pid);
CREATE INDEX idx_pokemonitemlink_iid ON PokemonItemLink(iid);


CREATE TABLE Trainers (
    tid         SERIAL PRIMARY KEY,
    name        VARCHAR(40) NOT NULL,
    userid      VARCHAR(8) NOT NULL,
    email       VARCHAR(40) UNIQUE,
    passwordH   VARCHAR(512) NOT NULL,
    CreatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(name, userid)
);

CREATE TABLE Pokemons (
    pokemonid   SERIAL PRIMARY KEY,
    tid         INTEGER NOT NULL REFERENCES Trainers(tid) ON DELETE CASCADE,
    pid         INTEGER NOT NULL REFERENCES Pokemon(pid),
    amount      INTEGER NOT NULL,
    CreatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(pid, tid)
);

CREATE INDEX idx_pokemons_tid ON Pokemons(tid);
