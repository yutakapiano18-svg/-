// ==========================================
// 🎮 スト6 コンボ管理データ (data.js)
// ==========================================

// スト6 全キャラ一覧 (Year 3: アレックスまで)
export const characters = [
  'リュウ', 'ルーク', 'ジェイミー', '春麗', 'ガイル', 'キンバリー', 'ジュリ', 'ケン', 'ブランカ',
  'ダルシム', 'E.本田', 'ディージェイ', 'マノン', 'マリーザ', 'JP', 'ザンギエフ', 'リリー', 'キャミィ',
  'ラシード', 'A.K.I.', 'エド', '豪鬼', 'ベガ', 'テリー', '舞', 'エレナ', 'サガット', 'C.ヴァイパー', 'アレックス'
];

// 用途・シチュエーション
export const situations = [
  '小攻撃始動', '中攻撃始動', '大攻撃始動', '中足ラッシュ', '中段', '対空', '画面端', '飛び', 'シミー',
  'カウンター始動', 'パニカン始動', 'DR始動', 'バーンアウト（自分）', 'バーンアウト（相手）',
  '最大ダメージ', '起き攻め重視', '運び重視', '補正切り', 'SA1', 'SA2', 'SA3', 'ネタ', '魅せコン'
];

// === コンボビルダー: テンキー表記 (1〜9) ===
export const numpadDirections = [
  { num: '7', arrow: '↖', kanji: '後ジャンプ' },
  { num: '8', arrow: '↑', kanji: 'ジャンプ' },
  { num: '9', arrow: '↗', kanji: '前ジャンプ' },
  { num: '4', arrow: '←', kanji: '後' },
  { num: '5', arrow: 'N', kanji: '立' },
  { num: '6', arrow: '→', kanji: '前' },
  { num: '1', arrow: '↙', kanji: '後屈' },
  { num: '2', arrow: '↓', kanji: '屈' },
  { num: '3', arrow: '↘', kanji: '前屈' },
];

// === 攻撃の強度 ===
export const strengthOptions = {
  alphabet: [
    { key: 'L', label: 'L', desc: '弱' },
    { key: 'M', label: 'M', desc: '中' },
    { key: 'H', label: 'H', desc: '強' },
  ],
  japanese: [
    { key: 'L', label: '弱', desc: '弱' },
    { key: 'M', label: '中', desc: '中' },
    { key: 'H', label: '強', desc: '強' },
  ],
};

// ボタン
export const attackButtons = [
  { label: 'P', desc: 'パンチ' },
  { label: 'K', desc: 'キック' },
];

// システムメカニクス・特殊操作
export const specials = [
  { label: '>', value: ' > ', desc: 'つなぎ(キャンセル)' },
  { label: 'J', value: 'J', desc: 'ジャンプ' },
  { label: 'CR', value: 'CR', desc: 'キャンセルラッシュ' },
  { label: 'DR', value: 'DR', desc: 'ドライブラッシュ' },
  { label: 'DI', value: 'DI', desc: 'ドライブインパクト' },
  { label: 'PTC', value: 'PTC', desc: 'パンチタゲコン' },
  { label: 'KTC', value: 'KTC', desc: 'キックタゲコン' },
  { label: '投げ', value: '投げ', desc: '通常投げ' },
  { label: '歩き', value: '歩き', desc: '前歩き' },
  { label: '微歩き', value: '微歩き', desc: '微歩き' },
  { label: '前ステ', value: '前ステ', desc: '前ステップ' },
  { label: 'バクステ', value: 'バクステ', desc: 'バックステップ' },
  { label: 'C', value: 'C', desc: 'キャンセル' },
  { label: 'NC', value: 'NC', desc: 'ノーキャンセル' },
  { label: 'D', value: 'D', desc: 'ディレイ' },
  { label: 'SA1', value: 'SA1', desc: 'スーパーアーツ1' },
  { label: 'SA2', value: 'SA2', desc: 'スーパーアーツ2' },
  { label: 'SA3', value: 'SA3', desc: 'スーパーアーツ3' },
];

// === 各キャラの必殺技リスト (名前 & コマンド) ===
export const characterMoves = {
  'リュウ': [
    { name: '波動拳', cmd: '↓↘→P' },
    { name: '昇龍拳', cmd: '→↓↘P' },
    { name: '竜巻旋風脚', cmd: '↓↙←K' },
    { name: '空中竜巻旋風脚', cmd: 'J+↓↙←K' },
    { name: '上段足刀蹴り', cmd: '↓↘→K' },
    { name: '波掌撃', cmd: '↓↙←P' },
    { name: '電刃錬気', cmd: '↓↓P' }
  ],
  'ルーク': [
    { name: 'サンドブラスト', cmd: '↓↘→P' },
    { name: 'ライジングアッパー', cmd: '→↓↘P' },
    { name: 'フラッシュナックル', cmd: '↓↙←P' },
    { name: 'アベンジャー', cmd: '↓↘→K' },
    { name: 'ノーチェイサー', cmd: 'K(Avenger中)' },
    { name: 'インパラ', cmd: 'P(Avenger中)' },
    { name: 'エアフラッシュナックル', cmd: 'J+↓↙←P' }
  ],
  'ジェイミー': [
    { name: '魔身', cmd: '↓↓P' },
    { name: '流酔拳', cmd: '↓↘→P' },
    { name: '酔疾歩', cmd: '↓↘→K' },
    { name: '張弓腿', cmd: '→↓↘K' },
    { name: '無影蹴', cmd: 'J+↓↙←K' },
    { name: '爆廻', cmd: '↓↙←K' },
    { name: '点辰', cmd: '→↘↓↙←K' },
    { name: '疾歩仙掌', cmd: '6K(酔疾歩中)' },
    { name: '潜月脚', cmd: '6K(流酔拳中)' }
  ],
  '春麗': [
    { name: '気功拳', cmd: '[←]→P' },
    { name: '百裂脚', cmd: '↓↘→K' },
    { name: '百裂脚(空中)', cmd: 'J+↓↘→K' },
    { name: 'スピニングバードキック', cmd: '[↓]↑K' },
    { name: '覇山蹴', cmd: '↓↙←K' },
    { name: '旋鳳起', cmd: '↓↓K' },
    { name: '水蓮掌', cmd: '↘H' }
  ],
  'ガイル': [
    { name: 'ソニックブーム', cmd: '[←]→P' },
    { name: 'サマーソルトキック', cmd: '[↓]↑K' },
    { name: 'ソニックブレイド', cmd: '↓↙←P' },
    { name: 'ソニッククロス', cmd: '6P(ブレイド中)' },
    { name: 'サマーソルトレイジ', cmd: '2-8KKP' } // 簡易表示
  ],
  'キンバリー': [
    { name: '疾駆け', cmd: '↓↘→K' },
    { name: '武神旋風脚', cmd: '↓↙←K' },
    { name: '武神連閃脚', cmd: '↓↘→P' },
    { name: '武神イズナ落とし', cmd: 'J+↓↘→P' },
    { name: '武神手裏剣', cmd: '↓↓P' },
    { name: 'スプレーボム', cmd: '↓↓K' }
  ],
  'ジュリ': [
    { name: '風破刃', cmd: '↓↙←K' },
    { name: '歳破衝', cmd: '↓↘→LK' },
    { name: '五黄殺', cmd: '↓↘→MK' },
    { name: '斬せん蹴', cmd: '↓↘→HK' },
    { name: '天穿輪', cmd: '→↓↘K' },
    { name: '疾空閃', cmd: 'J+↓↙←K' }
  ],
  'ケン': [
    { name: '波動拳', cmd: '↓↘→P' },
    { name: '昇龍拳', cmd: '→↓↘P' },
    { name: '竜巻旋風脚', cmd: '↓↙←K' },
    { name: '空中竜巻旋風脚', cmd: 'J+↓↙←K' },
    { name: '龍尾脚', cmd: '↓↘→K' },
    { name: '迅雷脚', cmd: '↓↘→K' },
    { name: '火砕蹴', cmd: '6K(迅雷中)' },
    { name: '奮迅脚', cmd: '↓↘→KK' }
  ],
  'ブランカ': [
    { name: 'エレクトリックサンダー', cmd: '↓↙←P' },
    { name: 'ローリングアタック', cmd: '[←]→P' },
    { name: 'バックステップローリング', cmd: '→↘↓↙←K' },
    { name: 'バーチカルローリング', cmd: '[↓]↑K' },
    { name: 'ワイルドハント', cmd: '→↓↘K' },
    { name: 'ブランカちゃん人形投げ', cmd: '↓↓P' }
  ],
  'ダルシム': [
    { name: 'ヨガファイア', cmd: '↓↘→P' },
    { name: 'ヨガアーチ', cmd: '↓↙←P' },
    { name: 'ヨガフレイム', cmd: '→↘↓↙←P' },
    { name: 'ヨガブラスト', cmd: '↓↙←K' },
    { name: 'ヨガコメット', cmd: 'J+↓↘→P' },
    { name: 'ヨガテレポート', cmd: '→↓↘+PPP/KKK' },
    { name: 'ヨガフロート', cmd: 'J+↑+KK' }
  ],
  'E.本田': [
    { name: '百裂張り手', cmd: '↓↘→P' },
    { name: 'スーパー頭突き', cmd: '[←]→P' },
    { name: 'スーパー百貫落とし', cmd: '[↓]↑K' },
    { name: '大銀杏投げ', cmd: '→↘↓↙←K' },
    { name: '張り手ラッシュ', cmd: '↓↘→K' },
    { name: '駒投げ', cmd: '↓↓P' }
  ],
  'ディージェイ': [
    { name: 'エアスラッシャー', cmd: '[←]→P' },
    { name: 'ジャックナイフマキシマム', cmd: '[↓]↑K' },
    { name: 'マシンガンアッパー', cmd: '↓↙←P' },
    { name: 'ローリングソバット', cmd: '↓↘→K' },
    { name: 'クイックローリング', cmd: '↓↙←K' },
    { name: 'ファンキースライサー', cmd: 'K(Quick中)' }
  ],
  'マノン': [
    { name: 'マネージュ・ドレ', cmd: '↓↘→P' },
    { name: 'ロンポワン', cmd: '→↓↘K' },
    { name: 'デガジェ', cmd: '↓↙←K' },
    { name: 'アン・オー', cmd: '↓↓K' },
    { name: 'ルヴェランス', cmd: '↓↘→K' }
  ],
  'マリーザ': [
    { name: 'グラディウス', cmd: '↓↘→P' },
    { name: 'ファランクス', cmd: '→↓↘P' },
    { name: 'クアドリガ', cmd: '↓↘→K' },
    { name: 'スクトゥム', cmd: '↓↙←K' },
    { name: 'エンクレイアス', cmd: '↓↙←P' },
    { name: 'パーン', cmd: 'P(Scutum中)' }
  ],
  'JP': [
    { name: 'トリグラフ', cmd: '↓↓P' },
    { name: 'ストリボーグ', cmd: '↓↙←P' },
    { name: 'ヴィーハト', cmd: '↓↘→P' },
    { name: 'デパルチュール', cmd: '↓↘→P(Wihat中)' },
    { name: 'アムネジア', cmd: '↓↓K' },
    { name: 'トルバラン', cmd: '↓↘→K' },
    { name: 'アブニマーチ', cmd: '↓↙←K' }
  ],
  'ザンギエフ': [
    { name: 'スクリューパイルドライバー', cmd: '360P' },
    { name: 'ダブルラリアット', cmd: 'PPP' },
    { name: 'ボルシチダイナミック', cmd: 'J+360P' },
    { name: 'シベリアンエクスプレス', cmd: '→↘↓↙←K' },
    { name: 'ツンドラストーム', cmd: '↓↓K' }
  ],
  'リリー': [
    { name: 'コンドルウィンド', cmd: '↓↙←P' },
    { name: 'コンドルスパイア', cmd: '↓↘→K' },
    { name: 'コンドルダイブ', cmd: 'J+PPP' },
    { name: 'トマホークバスター', cmd: '→↓↘P' },
    { name: 'メキシカンタイフーン', cmd: '360P' }
  ],
  'キャミィ': [
    { name: 'スパイラルアロー', cmd: '↓↘→K' },
    { name: 'キャノンスパイク', cmd: '→↓↘K' },
    { name: 'アクセルスピンナックル', cmd: '↓↙←P' },
    { name: 'フーリガンコンビネーション', cmd: '↓↘→P' },
    { name: 'キャノンストライク', cmd: 'J+↓↙←K' },
    { name: 'クイックスピンナックル', cmd: '↓↙←P' }
  ],
  'ラシード': [
    { name: 'スピニングミキサー', cmd: '↓↘→P' },
    { name: 'イーグルスパイク', cmd: '↓↙←K' },
    { name: 'ワールウィンドショット', cmd: '↓↘→K' },
    { name: 'アラビアンサイクロン', cmd: '↓↙←P' },
    { name: 'アラビアンスカイハイ', cmd: 'J+↓↘→P' }
  ],
  'A.K.I.': [
    { name: '蛇頭鞭', cmd: '↓↘→P' },
    { name: '紫煙砲', cmd: '↓↙←P' },
    { name: '毒溜め', cmd: '↓↓P' },
    { name: '蛇連咬', cmd: '↓↘→K' },
    { name: '蛇軟体', cmd: '↓↙←K' },
    { name: '紫煙霧', cmd: 'P(Jantai中)' }
  ],
  'エド': [
    { name: 'サイコアッパー', cmd: '↓↘→P' },
    { name: 'サイコブリッツ', cmd: '↓↙←P' },
    { name: 'サイコフリッカー', cmd: '↓↘→K' },
    { name: 'サイコスパーク', cmd: '↓↓P' },
    { name: 'サイコシュパーレ', cmd: '6P(Spark中)' },
    { name: 'キルラッシュ', cmd: '↓↘→K' }
  ],
  '豪鬼': [
    { name: '豪波動拳', cmd: '↓↘→P' },
    { name: '豪昇龍拳', cmd: '→↓↘P' },
    { name: '竜巻斬空脚', cmd: '↓↙←K' },
    { name: '斬空波動拳', cmd: 'J+↓↘→P' },
    { name: '金剛灼火', cmd: '↓↘→K' },
    { name: '朧', cmd: '→↘↓↙←K' },
    { name: '羅刹脚', cmd: '↓↓K' },
    { name: '百鬼襲', cmd: '→↓↘K' },
    { name: '阿修羅閃空', cmd: '←↓↙+PPP/KKK' }
  ],
  'ベガ': [
    { name: 'バックフィスト', cmd: '↓↙←P' },
    { name: 'サイコクラッシャーアタック', cmd: '[←]→P' },
    { name: 'ダブルニープレス', cmd: '↓↘→K' },
    { name: 'バックマジック', cmd: 'P(D-Knee中)' },
    { name: 'シャドウライズ', cmd: '[↓]↑K' },
    { name: 'ヘッドプレス', cmd: 'P(Rise中)' },
    { name: 'デビルリバース', cmd: 'P(Rise中)' }
  ],
  'テリー': [
    { name: 'パワーウェイブ', cmd: '↓↘→P' },
    { name: 'バーンナックル', cmd: '↓↙←P' },
    { name: 'ライジングタックル', cmd: '[↓]↑P' },
    { name: 'クラックシュート', cmd: '↓↙←K' },
    { name: 'パワーダンク', cmd: '→↓↘K' },
    { name: 'パワーチャージ', cmd: '↓↘→K' }
  ],
  '舞': [
    { name: '花蝶扇', cmd: '↓↘→P' },
    { name: '龍炎舞', cmd: '↓↙←P' },
    { name: '必殺忍蜂', cmd: '←↙↓↘→K' },
    { name: 'ムササビの舞', cmd: 'J+↓↙←P' },
    { name: '小夜千鳥', cmd: '↓↙←K' }
  ],
  'エレナ': [
    { name: 'ライノホーン', cmd: '↓↘→K' },
    { name: 'スピンサイス', cmd: '↓↙←K' },
    { name: 'マレットスマッシュ', cmd: '→↓↘P' },
    { name: 'リンクススパイク', cmd: '→↓↘K' },
    { name: 'シルフハブ', cmd: '↓↓P' }
  ],
  'サガット': [
    { name: 'タイガーショット', cmd: '↓↘→P' },
    { name: 'グランドタイガーショット', cmd: '↓↘→K' },
    { name: 'タイガーアッパーカット', cmd: '→↓↘P' },
    { name: 'タイガーニークラッシュ', cmd: '↓↘→K' },
    { name: 'タイガーネクサス', cmd: '↓↙←K' }
  ],
  'C.ヴァイパー': [
    { name: 'サンダースラップ', cmd: '↓↙←P' },
    { name: 'セイスモハンマー', cmd: '→↓↘P' },
    { name: 'バーニングキック', cmd: '↓↙←K' },
    { name: 'バーストハイヒール', cmd: '↓↘→K' },
    { name: 'エマージェンシー', cmd: '↓↓P' }
  ],
  'アレックス': [
    { name: 'パワーボム', cmd: '→↘↓↙←K' },
    { name: 'フラッシュチョップ', cmd: '↓↘→P' },
    { name: 'エアニーブラッシュ', cmd: '→↓↘K' },
    { name: 'スラッシュエルボー', cmd: '[←]→K' },
    { name: 'ヘッドスタンプ', cmd: '[↓]↑K' },
    { name: 'ブレイカー・スタンス', cmd: '↓↓P' }
  ]
};
