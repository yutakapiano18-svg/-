import { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import { characters, situations, numpadDirections, strengthOptions, attackButtons, specials, characterMoves } from './data'

// ========== ローカルストレージ用ヘルパー ==========
const LS = {
  get: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
}

// ========== 投稿者IDの取得・生成 (自分だけが編集・削除できるように) ==========
const myUserId = LS.get('myUserId', null) || (() => {
  const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
  LS.set('myUserId', newId)
  return newId
})()

// ========== UI文言一括管理 (ここを書き換えるだけでサイトの文字が変わります) ==========
const UI_TEXT = {
  APP_TITLE: 'SF6 Combo Board',
  SEARCH_TAB: '検索',
  SAVE_TAB: '保存済み',
  POST_BTN: '＋ 投稿',
  SETTINGS_BTN: '⚙️',
  FEEDBACK_BTN: '🛠 要望・バグ報告',

  // 投稿フォーム
  POST_MODAL_TITLE: '新規コンボ投稿',
  EDIT_MODAL_TITLE: 'コンボの編集',
  LABEL_CHAR: 'キャラクター',
  LABEL_TYPE: '操作タイプ',
  LABEL_SIT: 'シチュエーション',
  LABEL_RECIPE: 'コンボレシピ',
  LABEL_DMG: 'ダメージ',
  LABEL_DRIVE: 'ドライブゲージ消費',
  LABEL_SUPER: 'スーパーゲージ消費',
  LABEL_TAGS: 'タグ（「、」で区切り）',
  LABEL_DESC: '解説・補足',
  BTN_POST: 'コンボを投稿する',
  BTN_UPDATE: 'コンボを更新する',
  BTN_CANCEL: 'キャンセル',

  // プレースホルダー / ラベル
  SIT_OTHER_PLACEHOLDER: '例: 後ろ投げ後',
  DMG_PLACEHOLDER: 'ダメージ数値を入力',
  TAGS_PLACEHOLDER: 'タグを「、」で区切って入力',
  DESC_PLACEHOLDER: 'コンボのコツや解説を入力...',
  BUILDER_LABEL_DIR: '方向 (テンキー)',
  BUILDER_LABEL_STR: '強度',
  BUILDER_LABEL_BTN: 'ボタン',
  BUILDER_LABEL_SPEC: '技名',
  BUILDER_TITLE_SPEC: '必殺技',

  // フィードバック
  FEEDBACK_TITLE: '🛠 要望・バグ報告を送る',
  FEEDBACK_PLACEHOLDER: 'バグの報告や、追加して欲しい機能など自由に入力してください。',
  FEEDBACK_SUBMIT: '送信する',
  FEEDBACK_CANCEL: '閉じる',
  FEEDBACK_SUCCESS: 'ありがとうございます！報告を送信しました。',
  FEEDBACK_ERROR: '送信に失敗しました。',
}

function App() {
  // === データ ===
  const [combos, setCombos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // === タブ ===
  const [activeTab, setActiveTab] = useState('search')

  // === フィードバック ===
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)

  // === 検索 & フィルター ===
  const [searchQuery, setSearchQuery] = useState('')
  const [filterChar, setFilterChar] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterSit, setFilterSit] = useState('All')
  const [searchHistory, setSearchHistory] = useState(() => LS.get('sf6_search_history', []))

  // === パーソナライズ (localStorage) ===
  const [likedCombos, setLikedCombos] = useState(() => LS.get('sf6_liked_combos', []))
  const [likedComments, setLikedComments] = useState(() => LS.get('sf6_liked_comments', []))
  const [savedCombos, setSavedCombos] = useState(() => LS.get('sf6_saved_combos', []))
  const [viewHistory, setViewHistory] = useState(() => LS.get('sf6_view_history', []))

  // === 設定 ===
  const [strengthMode, setStrengthMode] = useState(() => LS.get('sf6_strength_mode', 'alphabet'))
  const [displayMode, setDisplayMode] = useState(() => LS.get('sf6_display_mode', 'name')) // 'name' or 'cmd'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // === モーダル関連 ===
  const [detailCombo, setDetailCombo] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isReacting, setIsReacting] = useState(false)

  // === フォーム State ===
  const [fChar, setFChar] = useState(characters[0])
  const [fType, setFType] = useState('Classic')
  const [fSit, setFSit] = useState(situations[0])
  const [fOtherSit, setFOtherSit] = useState('')
  const [fRecipe, setFRecipe] = useState('')
  const [fDmg, setFDmg] = useState('')
  const [fDrive, setFDrive] = useState('0')
  const [fSuper, setFSuper] = useState('0')
  const [fTags, setFTags] = useState('')
  const [fDesc, setFDesc] = useState('')

  // === コンボビルダーState ===
  const [bDir, setBDir] = useState('5')  // テンキー番号で管理
  const [bStr, setBStr] = useState('M')
  const [bBtn, setBBtn] = useState('P')
  const [bSpecMove, setBSpecMove] = useState('') // 選択中の必殺技
  const [bSpecStr, setBSpecStr] = useState('M')  // 必殺技の強度 (L/M/H/OD)

  // キャラクター変更時に必殺技の初期値をセット
  useEffect(() => {
    const moves = characterMoves[fChar] || []
    setBSpecMove(moves[0]?.name || '')
  }, [fChar])

  // === コメント入力 ===
  const [commentText, setCommentText] = useState('')

  // 現在の強度ラベルリストを取得
  const currentStrengths = strengthOptions[strengthMode] || strengthOptions.alphabet

  // ========== データ取得 ==========
  const fetchCombos = useCallback(async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('combos')
      .select('*, comments(*)')
      .order('created_at', { ascending: false })
    if (!error) setCombos(data || [])
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchCombos() }, [fetchCombos])

  // ========== ローカルストレージ同期 ==========
  useEffect(() => { LS.set('sf6_liked_combos', likedCombos) }, [likedCombos])
  useEffect(() => { LS.set('sf6_liked_comments', likedComments) }, [likedComments])
  useEffect(() => { LS.set('sf6_saved_combos', savedCombos) }, [savedCombos])
  useEffect(() => { LS.set('sf6_view_history', viewHistory) }, [viewHistory])
  useEffect(() => { LS.set('sf6_search_history', searchHistory) }, [searchHistory])
  useEffect(() => { LS.set('sf6_strength_mode', strengthMode) }, [strengthMode])
  useEffect(() => { LS.set('sf6_display_mode', displayMode) }, [displayMode])

  const triggerGlow = () => {
    setIsReacting(true)
    setTimeout(() => setIsReacting(false), 200)
  }

  // ========== コンボビルダー ==========
  const getDirectionDisplay = (numKey) => {
    return numKey // 5も含め、テンキー番号をそのまま表示
  }

  const getStrengthDisplay = (key) => {
    const s = currentStrengths.find(x => x.key === key)
    return s ? s.label : key
  }

  const pushToRecipe = (val) => {
    setFRecipe(prev => {
      let next = prev
      if (!prev) next = val
      else {
        // 特定のパーツ（C, NC, J, CR）の後は矢印を入れずに連結
        const connectors = ['C', 'NC', 'J', 'CR']
        const endsWithConnector = connectors.some(c => prev.trim().endsWith(c))
        if (endsWithConnector && val !== ' > ' && val !== ' ≫ ') {
          next = prev + val
        } else if (val === ' > ' || val === ' ≫ ') {
          next = prev + val
        } else {
          next = prev + ' > ' + val
        }
      }
      return next
    })
    triggerGlow()
  }

  const addNormalMove = () => {
    const dir = getDirectionDisplay(bDir)
    const str = getStrengthDisplay(bStr)
    const move = dir + str + bBtn
    pushToRecipe(move)
  }

  const addSpecialPart = (val) => {
    pushToRecipe(val)
  }

  const addCharacterMove = () => {
    if (!bSpecMove) return
    let strDisplay = ''
    if (bSpecStr === 'OD') {
      strDisplay = 'OD'
    } else if (bSpecStr !== 'none') {
      strDisplay = getStrengthDisplay(bSpecStr)
    }
    const move = strDisplay + bSpecMove
    pushToRecipe(move)
  }

  const handleSendFeedback = async () => {
    if (!feedbackText.trim() || isSendingFeedback) return
    setIsSendingFeedback(true)
    const { error } = await supabase.from('feedback').insert([{ message: feedbackText }])
    if (error) {
      alert(UI_TEXT.FEEDBACK_ERROR)
    } else {
      alert(UI_TEXT.FEEDBACK_SUCCESS)
      setFeedbackText('')
      setIsFeedbackOpen(false)
    }
    setIsSendingFeedback(false)
  }

  // ========== 表記変換（レシピの強度表示を設定に合わせて変換） ==========
  const convertRecipeNotation = (recipe) => {
    if (!recipe) return recipe
    // アルファベット → 日本語、または 日本語 → アルファベットに変換
    // 通常技の表記パターン: (数字)(強度)(P|K)
    // 例: 2MP, 5LP, 2弱P, 5中K など
    if (strengthMode === 'japanese') {
      // L→弱, M→中, H→強 に変換（通常技パターン内のみ）
      return recipe
        .replace(/(\d)(L)(P|K)/g, '$1弱$3')
        .replace(/(\d)(M)(P|K)/g, '$1中$3')
        .replace(/(\d)(H)(P|K)/g, '$1強$3')
    } else {
      // 弱→L, 中→M, 強→H に変換
      return recipe
        .replace(/(\d)(弱)(P|K)/g, '$1L$3')
        .replace(/(\d)(中)(P|K)/g, '$1M$3')
        .replace(/(\d)(強)(P|K)/g, '$1H$3')
    }
  }

  const undoLastPart = () => {
    const parts = fRecipe.split(' > ')
    parts.pop()
    setFRecipe(parts.join(' > '))
    triggerGlow()
  }

  // レシピ内の技名をコマンドに変換（またはその逆）
  const formatRecipe = useCallback((recipe, char, mode) => {
    if (!recipe || !char) return recipe
    const moves = characterMoves[char] || []
    let formatted = convertRecipeNotation(recipe) // まず強度表記などを変換

    // 単純な置換だと「波動拳」が「↓↘→P」に含まれる場合に壊れる可能性があるため、
    // 長い名前から順に置換するか、区切り文字で分割して処理するのが安全
    const sortedMoves = [...moves].sort((a, b) => b.name.length - a.name.length)

    sortedMoves.forEach(m => {
      if (mode === 'cmd') {
        // 技名 -> コマンド
        // 全置換（gフラグ）を使用。日本語には \b が効かないため、単純置換で対応
        formatted = formatted.split(m.name).join(m.cmd)
      } else {
        // コマンド -> 技名
        formatted = formatted.split(m.cmd).join(m.name)
      }
    })
    return formatted
  }, [displayMode, strengthMode])

  // ========== コンボ投稿 / 編集 ==========
  const resetForm = () => {
    setFChar(characters[0]); setFType('Classic'); setFSit(situations[0])
    setFOtherSit(''); setFRecipe(''); setFDmg(''); setFDrive('0')
    setFSuper('0'); setFTags(''); setFDesc('')
  }

  const openAddForm = () => {
    resetForm(); setIsEditing(false); setEditingId(null); setIsFormOpen(true)
  }

  const openEditForm = (c) => {
    setFChar(c.character); setFType(c.type)
    if (situations.includes(c.situation)) { setFSit(c.situation); setFOtherSit('') }
    else { setFSit('その他'); setFOtherSit(c.situation) }
    setFRecipe(c.recipe); setFDmg(c.damage ? String(c.damage) : '')
    setFDrive(String(c.drive || 0)); setFSuper(String(c.super || 0))
    setFTags(c.tags ? c.tags.join('、') : ''); setFDesc(c.description || '')
    setIsEditing(true); setEditingId(c.id); setIsFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!fRecipe.trim()) return alert('コンボレシピは必須です！')
    const sit = fSit === 'その他' ? fOtherSit.trim() : fSit
    if (!sit) return alert('シチュエーションを入力してください')

    setIsSaving(true)
    const payload = {
      character: fChar, type: fType, situation: sit, recipe: fRecipe,
      damage: parseInt(fDmg) || 0, drive: parseFloat(fDrive) || 0,
      super: parseInt(fSuper) || 0,
      tags: fTags.split('、').map(t => t.trim()).filter(Boolean),
      description: fDesc
    }
    // 新規投稿時のみ author_id を設定
    if (!isEditing) payload.author_id = myUserId;

    try {
      if (isEditing) {
        setCombos(combos.map(c => c.id === editingId ? { ...c, ...payload } : c))
        const { error } = await supabase.from('combos').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('combos').insert([payload]).select()
        if (error) throw error
        if (data?.[0]) setCombos([{ ...data[0], comments: [] }, ...combos])
      }
      setIsFormOpen(false)
    } catch (err) {
      console.error(err)
      alert('保存に失敗しました。ネットワーク状況を確認してください。')
    } finally {
      setIsSaving(false)
    }
  }

  // ========== いいね (コンボ) ==========
  const handleLikeCombo = async (id) => {
    const combo = combos.find(c => c.id === id)
    const alreadyLiked = likedCombos.includes(id)
    const newLikes = alreadyLiked
      ? Math.max((combo?.likes || 0) - 1, 0)
      : (combo?.likes || 0) + 1

    // ローカルのいいね状態をトグル
    setLikedCombos(alreadyLiked
      ? likedCombos.filter(x => x !== id)
      : [...likedCombos, id]
    )
    setCombos(combos.map(c => c.id === id ? { ...c, likes: newLikes } : c))
    if (detailCombo?.id === id) setDetailCombo(prev => ({ ...prev, likes: newLikes }))
    await supabase.from('combos').update({ likes: newLikes }).eq('id', id)
  }

  // ========== いいね (コメント) ==========
  const handleLikeComment = async (commentId) => {
    if (likedComments.includes(commentId)) return
    setLikedComments([...likedComments, commentId])
    const updateCommentLikes = (comboList) => comboList.map(c => ({
      ...c,
      comments: c.comments?.map(cm =>
        cm.id === commentId ? { ...cm, likes: (cm.likes || 0) + 1 } : cm
      )
    }))
    setCombos(updateCommentLikes)
    if (detailCombo) {
      setDetailCombo(prev => ({
        ...prev,
        comments: prev.comments?.map(cm =>
          cm.id === commentId ? { ...cm, likes: (cm.likes || 0) + 1 } : cm
        )
      }))
    }
    const target = combos.flatMap(c => c.comments || []).find(cm => cm.id === commentId)
    if (target) {
      await supabase.from('comments').update({ likes: (target.likes || 0) + 1 }).eq('id', commentId)
    }
  }

  // ========== コメント投稿 ==========
  const handleAddComment = async (comboId) => {
    if (!commentText.trim()) return
    const { data, error } = await supabase.from('comments').insert([{
      combo_id: comboId, text: commentText.trim()
    }]).select()
    if (!error && data?.[0]) {
      const newComment = { ...data[0], likes: 0 }
      setCombos(combos.map(c =>
        c.id === comboId ? { ...c, comments: [...(c.comments || []), newComment] } : c
      ))
      if (detailCombo?.id === comboId) {
        setDetailCombo(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }))
      }
      setCommentText('')
    }
  }

  // ========== 保存 (ブックマーク) ==========
  const toggleSave = (id) => {
    setSavedCombos(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // ========== 閲覧履歴 ==========
  const openDetail = (combo) => {
    setDetailCombo(combo); setCommentText('')
    setViewHistory(prev => {
      const filtered = prev.filter(id => id !== combo.id)
      return [combo.id, ...filtered].slice(0, 30)
    })
  }

  // ========== 検索履歴 ==========
  const saveSearchCondition = () => {
    const label = [
      filterChar !== 'All' ? filterChar : '',
      filterType !== 'All' ? filterType : '',
      filterSit !== 'All' ? filterSit : '',
      searchQuery
    ].filter(Boolean).join(' / ')
    if (!label) return
    setSearchHistory(prev => {
      if (prev.find(h => h.label === label)) return prev
      return [{ label, query: searchQuery, char: filterChar, type: filterType, sit: filterSit }, ...prev].slice(0, 10)
    })
  }
  const applySearchHistory = (h) => {
    setSearchQuery(h.query || ''); setFilterChar(h.char || 'All')
    setFilterType(h.type || 'All'); setFilterSit(h.sit || 'All')
  }
  const removeSearchHistory = (i) => setSearchHistory(prev => prev.filter((_, idx) => idx !== i))

  // ========== 削除 ==========
  const handleDelete = async (id) => {
    if (!confirm('このコンボを完全に削除しますか？')) return
    await supabase.from('combos').delete().eq('id', id)
    setCombos(combos.filter(c => c.id !== id))
    if (detailCombo?.id === id) setDetailCombo(null)
  }

  // ========== フィルタリング ==========
  const allTags = useMemo(() => [...new Set(combos.flatMap(c => c.tags || []))], [combos])
  const allSituations = useMemo(() => {
    const dbSits = combos.map(c => c.situation).filter(Boolean)
    return [...new Set([...situations, ...dbSits])]
  }, [combos])

  // === タグサジェスト機能 ===
  const currentTagPart = fTags.split('、').pop()?.trim() || ''
  const tagSuggestions = useMemo(() => {
    if (!isFormOpen) return []
    const alreadySelected = fTags.split('、').map(t => t.trim()).filter(Boolean)

    // 未入力時は、最近使われたタグを「おすすめ」として表示
    if (!currentTagPart) {
      return allTags.filter(t => !alreadySelected.includes(t)).slice(0, 8)
    }

    return allTags.filter(t =>
      t.toLowerCase().includes(currentTagPart.toLowerCase()) &&
      !alreadySelected.includes(t)
    ).slice(0, 8)
  }, [fTags, allTags, isFormOpen, currentTagPart])

  const addSuggestedTag = (tag) => {
    const parts = fTags.split('、')
    parts.pop() // 入力中のパーツを削除
    parts.push(tag)
    setFTags(parts.join('、') + '、')
  }

  // === シチュエーションサジェスト機能 ===
  const sitSuggestions = useMemo(() => {
    if (fSit !== 'その他' || !isFormOpen) return []
    const customSits = allSituations.filter(s => !situations.includes(s)) // 既製品は除く

    // 未入力時は、最近使われたカスタム状況を表示
    if (!fOtherSit.trim()) {
      return customSits.slice(0, 5)
    }

    return customSits
      .filter(s => s.toLowerCase().includes(fOtherSit.toLowerCase()) && s !== fOtherSit)
      .slice(0, 5)
  }, [fSit, fOtherSit, allSituations, isFormOpen])

  const filteredCombos = useMemo(() => {
    return combos.filter(c => {
      const q = searchQuery.toLowerCase()
      const matchQ = !q || c.recipe?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q)) ||
        c.character?.toLowerCase().includes(q)
      const matchChar = filterChar === 'All' || c.character === filterChar
      const matchType = filterType === 'All' || c.type === filterType
      const matchSit = filterSit === 'All' || c.situation === filterSit
      return matchQ && matchChar && matchType && matchSit
    })
  }, [combos, searchQuery, filterChar, filterType, filterSit])

  const displayCombos = useMemo(() => {
    if (activeTab === 'saved') return combos.filter(c => savedCombos.includes(c.id))
    if (activeTab === 'history') return viewHistory.map(id => combos.find(c => c.id === id)).filter(Boolean)
    return filteredCombos
  }, [activeTab, filteredCombos, combos, savedCombos, viewHistory])

  const sortedComments = (comments) => {
    if (!comments) return []
    return [...comments].sort((a, b) => (b.likes || 0) - (a.likes || 0))
  }

  // テンキーグリッド配置 (7,8,9 / 4,5,6 / 1,2,3)
  const numpadRows = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']]

  // ========================================
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-row">
          <div>
            <h1 className="title">{UI_TEXT.APP_TITLE}</h1>
            <p className="subtitle">みんなで作るスト6 コンボ辞書</p>
          </div>
          <div className="header-actions-left">
            <div className="display-toggle-group">
              <button className={`toggle-btn ${displayMode === 'name' ? 'active' : ''}`}
                onClick={() => setDisplayMode('name')}>技名</button>
              <button className={`toggle-btn ${displayMode === 'cmd' ? 'active' : ''}`}
                onClick={() => setDisplayMode('cmd')}>コマンド</button>
            </div>
          </div>
          <div className="header-actions-top">
            <button className="feedback-btn-text" onClick={() => setIsFeedbackOpen(true)}>
              {UI_TEXT.FEEDBACK_BTN}
            </button>
            <button className="settings-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)} title="設定">⚙️</button>
          </div>
        </div>
        {isSettingsOpen && (
          <div className="settings-panel">
            <div className="setting-item">
              <span className="flabel">強度の表記:</span>
              <button className={`fbtn ${strengthMode === 'alphabet' ? 'active' : ''}`}
                onClick={() => setStrengthMode('alphabet')}>英語 (L / M / H)</button>
              <button className={`fbtn ${strengthMode === 'japanese' ? 'active' : ''}`}
                onClick={() => setStrengthMode('japanese')}>日本語 (弱 / 中 / 強)</button>
            </div>
          </div>
        )}
      </header>

      {/* === タブ === */}
      <nav className="tabs">
        <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>🔍 検索</button>
        <button className={`tab ${activeTab === 'saved' ? 'active' : ''}`} onClick={() => setActiveTab('saved')}>🔖 保存 ({savedCombos.length})</button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>🕒 履歴</button>
      </nav>

      {/* === 検索パネル === */}
      {activeTab === 'search' && (
        <section className="glass-panel search-panel">
          <div className="search-top">
            <input className="search-bar" placeholder="レシピ / タグ / キャラ名で検索..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onBlur={saveSearchCondition} />
            <button className="btn-add" onClick={openAddForm}>＋ 投稿</button>
          </div>
          <div className="filter-rows">
            <div className="filter-row">
              <span className="flabel">キャラ:</span>
              <select className="fselect" value={filterChar} onChange={e => setFilterChar(e.target.value)}>
                <option value="All">全キャラ</option>
                {characters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="flabel">タイプ:</span>
              <button className={`fbtn ${filterType === 'All' ? 'active' : ''}`} onClick={() => setFilterType('All')}>全て</button>
              <button className={`fbtn ${filterType === 'Classic' ? 'active' : ''}`} onClick={() => setFilterType('Classic')}>Classic</button>
              <button className={`fbtn ${filterType === 'Modern' ? 'active' : ''}`} onClick={() => setFilterType('Modern')}>Modern</button>
            </div>
            <div className="filter-row">
              <span className="flabel">状況:</span>
              <div className="sit-chips">
                <button className={`sit-chip ${filterSit === 'All' ? 'active' : ''}`} onClick={() => setFilterSit('All')}>全て</button>
                {allSituations.map(s => (
                  <button key={s} className={`sit-chip ${filterSit === s ? 'active' : ''}`} onClick={() => setFilterSit(s)}>{s}</button>
                ))}
              </div>
            </div>
            {allTags.length > 0 && (
              <div className="filter-row">
                <span className="flabel">タグ:</span>
                <div className="tag-cloud">{allTags.map(t => (
                  <span key={t} className="cloud-tag" onClick={() => setSearchQuery(t)}>#{t}</span>
                ))}</div>
              </div>
            )}
          </div>
          {searchHistory.length > 0 && (
            <div className="search-history">
              <span className="flabel">最近:</span>
              {searchHistory.map((h, i) => (
                <span key={i} className="history-chip" onClick={() => applySearchHistory(h)}>
                  {h.label}
                  <button className="chip-x" onClick={e => { e.stopPropagation(); removeSearchHistory(i) }}>×</button>
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* === コンボ一覧 === */}
      <section className="combo-grid">
        {isLoading ? (
          <div className="empty-state">📡 接続中...</div>
        ) : displayCombos.length > 0 ? (
          displayCombos.map(combo => {
            const topComment = sortedComments(combo.comments)?.[0]
            return (
              <div key={combo.id} className="combo-card" onClick={() => openDetail(combo)}>
                <div className="card-top">
                  <span className="card-char">{combo.character}</span>
                  <span className={`card-type type-${combo.type?.toLowerCase()}`}>{combo.type}</span>
                  <span className="card-sit">{combo.situation}</span>
                </div>
                <div className="card-recipe">{formatRecipe(combo.recipe, combo.character, displayMode)}</div>
                <div className="card-stats">
                  <span className="cs-dmg">{combo.damage || '???'} DMG</span>
                  <span className="cs-drive">D:{combo.drive}</span>
                  <span className="cs-sa">SA:{combo.super}</span>
                </div>
                {combo.tags?.length > 0 && (
                  <div className="card-tags">
                    {combo.tags.map(t => <span key={t} className="card-tag">#{t}</span>)}
                  </div>
                )}
                <div className="card-bottom">
                  <span className="card-comments">💬 {combo.comments?.length || 0}</span>
                  {topComment && <span className="card-top-comment">「{topComment.text.slice(0, 25)}…」</span>}
                </div>
                <div className="card-actions">
                  <button
                    className={`card-action-btn card-like ${likedCombos.includes(combo.id) ? 'liked' : ''}`}
                    onClick={e => { e.stopPropagation(); handleLikeCombo(combo.id) }}

                  >
                    👍 {combo.likes || 0}
                  </button>
                  <button
                    className={`card-action-btn card-save ${savedCombos.includes(combo.id) ? 'saved' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleSave(combo.id) }}
                  >
                    {savedCombos.includes(combo.id) ? '🔖 保存済み' : '🔖 保存'}
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-state">
            {activeTab === 'saved' ? '🔖 保存済みコンボなし' :
              '🔎 コンボが見つかりません'}
          </div>
        )}
      </section>

      {/* ========== 詳細モーダル ========== */}
      {detailCombo && (
        <div className="modal-overlay" onClick={() => setDetailCombo(null)}>
          <div className="modal-detail" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setDetailCombo(null)}>×</button>
            <div className="detail-header">
              <div className="detail-header-left">
                <span className="detail-char">{detailCombo.character}</span>
                <span className={`detail-type type-${detailCombo.type?.toLowerCase()}`}>{detailCombo.type}</span>
                <span className="detail-sit">{detailCombo.situation}</span>
              </div>
              <div className="display-toggle-group mini-toggle">
                <button type="button" className={`toggle-btn ${displayMode === 'name' ? 'active' : ''}`}
                  onClick={() => setDisplayMode('name')}>技名</button>
                <button type="button" className={`toggle-btn ${displayMode === 'cmd' ? 'active' : ''}`}
                  onClick={() => setDisplayMode('cmd')}>コマンド</button>
              </div>
            </div>
            <div className="detail-recipe">{formatRecipe(detailCombo.recipe, detailCombo.character, displayMode)}</div>
            <div className="detail-stats">
              <div className="dstat"><span className="dstat-label">{UI_TEXT.LABEL_DMG}</span><span className="dstat-val dstat-dmg">{detailCombo.damage || '???'}</span></div>
              <div className="dstat"><span className="dstat-label">{UI_TEXT.LABEL_DRIVE}</span><span className="dstat-val dstat-drive">{detailCombo.drive}</span></div>
              <div className="dstat"><span className="dstat-label">{UI_TEXT.LABEL_SUPER}</span><span className="dstat-val dstat-sa">{detailCombo.super}</span></div>
            </div>
            {detailCombo.description && <p className="detail-desc">{detailCombo.description}</p>}
            {detailCombo.tags?.length > 0 && (
              <div className="detail-tags">{detailCombo.tags.map(t => <span key={t} className="dtag">#{t}</span>)}</div>
            )}
            <div className="detail-actions">
              <button className={`action-btn like-btn ${likedCombos.includes(detailCombo.id) ? 'liked' : ''}`}
                onClick={() => handleLikeCombo(detailCombo.id)}>
                👍 いいね {detailCombo.likes || 0}
              </button>
              <button className={`action-btn save-btn ${savedCombos.includes(detailCombo.id) ? 'saved' : ''}`}
                onClick={() => toggleSave(detailCombo.id)}>
                {savedCombos.includes(detailCombo.id) ? '🔖 保存済み' : '🔖 保存する'}
              </button>
            </div>

            {/* 管理ボタン (投稿者本人の場合のみ表示) */}
            {detailCombo.author_id === myUserId && (
              <div className="detail-actions manage-actions" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                <button className="action-btn edit-btn" onClick={() => { setDetailCombo(null); openEditForm(detailCombo) }}>📝 {UI_TEXT.BTN_EDIT || '編集'}</button>
                <button className="action-btn del-btn" onClick={() => handleDelete(detailCombo.id)}>🗑 {UI_TEXT.BTN_DELETE || '削除'}</button>
              </div>
            )}

            <div className="detail-comments">
              <h3>💬 コメント ({detailCombo.comments?.length || 0})</h3>
              <div className="comments-list-full">
                {sortedComments(detailCombo.comments).length > 0 ? (
                  sortedComments(detailCombo.comments).map(cm => (
                    <div key={cm.id} className="comment-row">
                      <span className="cm-text">{cm.text}</span>
                      <button className={`cm-like ${likedComments.includes(cm.id) ? 'liked' : ''}`}
                        onClick={() => handleLikeComment(cm.id)} disabled={likedComments.includes(cm.id)}>
                        👍 {cm.likes || 0}
                      </button>
                    </div>
                  ))
                ) : <div className="no-comments">まだコメントはありません</div>}
              </div>
              <form className="comment-form" onSubmit={e => { e.preventDefault(); handleAddComment(detailCombo.id) }}>
                <input placeholder="感想や改善点を送る..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                <button type="submit">送信</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========== コンボ入力フォーム ========== */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal-form" onClick={e => e.stopPropagation()}>
            <div className="modal-form-header">
              <h2>{isEditing ? UI_TEXT.EDIT_MODAL_TITLE : UI_TEXT.POST_MODAL_TITLE}</h2>
              <button className="modal-close" onClick={() => setIsFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave} className="combo-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="f-char">{UI_TEXT.LABEL_CHAR}</label>
                  <select id="f-char" value={fChar} onChange={e => setFChar(e.target.value)}>
                    {characters.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="f-type">{UI_TEXT.LABEL_TYPE}</label>
                  <select id="f-type" value={fType} onChange={e => setFType(e.target.value)}>
                    <option value="Classic">Classic</option>
                    <option value="Modern">Modern</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{UI_TEXT.LABEL_SIT}</label>
                <div className="form-row-inline">
                  <select value={fSit} onChange={e => setFSit(e.target.value)}>
                    {situations.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="その他">その他（自由入力）</option>
                  </select>
                  {fSit === 'その他' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                      <input type="text" value={fOtherSit} onChange={e => setFOtherSit(e.target.value)} placeholder={UI_TEXT.SIT_OTHER_PLACEHOLDER} className="sit-free-input" autoComplete="off" />
                      {sitSuggestions.length > 0 && (
                        <div className="tag-suggestions" style={{ marginTop: '0' }}>
                          <span className="suggestion-label">{fOtherSit.trim() ? '候補:' : '提出済み:'}</span>
                          {sitSuggestions.map(s => (
                            <button key={s} type="button" className="suggestion-chip" onClick={() => setFOtherSit(s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== コンボビルダー ===== */}
              <div className="form-group recipe-group">
                <label>コンボレシピ (必須)</label>

                <div className="builder-panel">
                  <p className="builder-title">🕹 通常技</p>
                  <div className="builder-main">
                    {/* テンキー方向キーパッド (3x3グリッド) */}
                    <div className="numpad-section">
                      <span className="bs-label">{UI_TEXT.BUILDER_LABEL_DIR}</span>
                      <div className="numpad-grid">
                        {numpadRows.map((row, ri) => (
                          <div key={ri} className="numpad-row">
                            {row.map(num => {
                              const d = numpadDirections.find(x => x.num === num)
                              return (
                                <button type="button" key={num}
                                  className={`numpad-btn ${bDir === num ? 'selected' : ''}`}
                                  onClick={() => setBDir(num)} title={d ? `${d.kanji} (${d.arrow})` : ''}>
                                  <span className="np-num">{num}</span>
                                  <span className="np-arrow">{d?.arrow}</span>
                                </button>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 右カラム (デスクトップ版で横並びにするため) */}
                    <div className="builder-right-col">
                      {/* 強度選択 (モバイルでは方向キーの横に配置可能) */}
                      <div className="builder-section builder-str-section">
                        <span className="bs-label">{UI_TEXT.BUILDER_LABEL_STR}</span>
                        <div className="bs-btns-vertical-flex">
                          {currentStrengths.map(s => (
                            <button type="button" key={s.key}
                              className={`bs-btn str-btn ${bStr === s.key ? 'selected' : ''}`}
                              style={bStr === s.key ? {
                                background: s.key === 'L' ? '#60a5fa' : s.key === 'M' ? '#facc15' : '#ef4444',
                                color: '#000'
                              } : {}}
                              onClick={() => setBStr(s.key)}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 攻撃ボタン + 追加 (モバイルでは下に配置) */}
                      <div className="builder-section builder-btn-section">
                        <div className="btn-row">
                          <span className="bs-label">{UI_TEXT.BUILDER_LABEL_BTN}</span>
                          <div className="bs-btns-horizontal">
                            {attackButtons.map(b => (
                              <button type="button" key={b.label}
                                className={`bs-btn ${bBtn === b.label ? 'selected' : ''}`}
                                onClick={() => setBBtn(b.label)}>
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button type="button" className="bs-add" onClick={addNormalMove}>
                          ＋ {getDirectionDisplay(bDir)}{getStrengthDisplay(bStr)}{bBtn}
                        </button>
                      </div>
                    </div>
                  </div>

                  {characterMoves[fChar] && (
                    <>
                      <p className="builder-title">🔥 {fChar} {UI_TEXT.BUILDER_TITLE_SPEC}</p>
                      <div className="builder-main spec-builder">
                        {/* 1. 必殺技の選択 */}
                        <div className="spec-move-section">
                          <div className="spec-section-header">
                            <span className="bs-label">{UI_TEXT.BUILDER_LABEL_SPEC}</span>
                            <div className="display-toggle-group mini-toggle">
                              <button type="button" className={`toggle-btn ${displayMode === 'name' ? 'active' : ''}`}
                                onClick={() => setDisplayMode('name')}>技名</button>
                              <button type="button" className={`toggle-btn ${displayMode === 'cmd' ? 'active' : ''}`}
                                onClick={() => setDisplayMode('cmd')}>コマンド</button>
                            </div>
                          </div>
                          <div className="spec-grid">
                            {(characterMoves[fChar] || []).map(move => (
                              <button
                                type="button"
                                key={move.name}
                                className={`spec-btn ${bSpecMove === move.name ? 'selected' : ''}`}
                                onClick={() => setBSpecMove(move.name)}
                              >
                                {displayMode === 'name' ? move.name : move.cmd}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. 強度の選択 */}
                        <div className="spec-str-section">
                          <span className="bs-label">{UI_TEXT.BUILDER_LABEL_STR}</span>
                          <div className="bs-btns-horizontal">
                            <button
                              type="button"
                              className={`bs-btn none-btn ${bSpecStr === 'none' ? 'selected' : ''}`}
                              onClick={() => setBSpecStr('none')}
                            >
                              なし
                            </button>
                            {currentStrengths.map(s => (
                              <button
                                type="button"
                                key={s.key}
                                className={`bs-btn str-btn ${bSpecStr === s.key ? 'selected' : ''}`}
                                style={bSpecStr === s.key ? {
                                  background: s.key === 'L' ? '#60a5fa' : s.key === 'M' ? '#facc15' : '#ef4444',
                                  color: '#000'
                                } : {}}
                                onClick={() => setBSpecStr(s.key)}
                              >
                                {s.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              className={`bs-btn od-btn ${bSpecStr === 'OD' ? 'selected' : ''}`}
                              onClick={() => setBSpecStr('OD')}
                            >
                              OD
                            </button>
                          </div>
                        </div>

                        {/* 3. 追加 */}
                        <button type="button" className="bs-add spec-add" onClick={addCharacterMove}>
                          ＋ {bSpecStr === 'none' ? '' : (bSpecStr === 'OD' ? 'OD' : getStrengthDisplay(bSpecStr))}
                          {displayMode === 'name' ? bSpecMove : (characterMoves[fChar]?.find(m => m.name === bSpecMove)?.cmd || bSpecMove)}
                        </button>
                      </div>
                    </>
                  )}

                  <p className="builder-title">🔧 特殊パーツ・つなぎ</p>
                  <div className="special-btns">
                    {specials.map(s => (
                      <button type="button" key={s.label} className="sp-btn"
                        onClick={() => addSpecialPart(s.value)} title={s.desc}>
                        {s.label}
                      </button>
                    ))}
                    <button type="button" className="sp-btn undo-btn" onClick={undoLastPart}>↩ 戻す</button>
                  </div>
                </div>

                <div className={`recipe-preview sticky-preview ${isReacting ? 'rp-react' : ''}`}>
                  <span className="rp-label">完成レシピ:</span>
                  <span className="rp-text">{fRecipe ? formatRecipe(fRecipe, fChar, displayMode) : '（ここにレシピが表示されます）'}</span>
                </div>

                <textarea className="recipe-textarea" value={fRecipe} onChange={e => setFRecipe(e.target.value)}
                  placeholder="直接テキストを入力" rows="2" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="f-dmg">{UI_TEXT.LABEL_DMG}</label>
                  <input id="f-dmg" type="number" value={fDmg} onChange={e => setFDmg(e.target.value)} placeholder={UI_TEXT.DMG_PLACEHOLDER} />
                </div>
                <div className="form-group">
                  <label htmlFor="f-drive">{UI_TEXT.LABEL_DRIVE}</label>
                  <select id="f-drive" value={fDrive} onChange={e => setFDrive(e.target.value)}>
                    {[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="f-super">{UI_TEXT.LABEL_SUPER}</label>
                  <select id="f-super" value={fSuper} onChange={e => setFSuper(e.target.value)}>
                    <option value="0">0</option>
                    <option value="1">SA1</option>
                    <option value="2">SA2</option>
                    <option value="3">SA3</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="f-tags">{UI_TEXT.LABEL_TAGS}</label>
                <input id="f-tags" value={fTags} onChange={e => setFTags(e.target.value)} placeholder={UI_TEXT.TAGS_PLACEHOLDER} autoComplete="off" />
                {tagSuggestions.length > 0 && (
                  <div className="tag-suggestions">
                    <span className="suggestion-label">{currentTagPart ? '候補:' : '人気・最近:'}</span>
                    {tagSuggestions.map(tag => (
                      <button key={tag} type="button" className="suggestion-chip" onClick={() => addSuggestedTag(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="f-desc">{UI_TEXT.LABEL_DESC}</label>
                <textarea id="f-desc" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder={UI_TEXT.DESC_PLACEHOLDER} rows="2" />
              </div>
              <button type="submit" className="btn-submit" disabled={isSaving}>
                {isSaving ? '送信中...' : (isEditing ? UI_TEXT.BTN_UPDATE : UI_TEXT.BTN_POST)}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========== フィードバックモーダル ========== */}
      {isFeedbackOpen && (
        <div className="feedback-overlay" onClick={() => setIsFeedbackOpen(false)}>
          <div className="feedback-modal" onClick={e => e.stopPropagation()}>
            <h2>{UI_TEXT.FEEDBACK_TITLE}</h2>
            <textarea
              placeholder={UI_TEXT.FEEDBACK_PLACEHOLDER}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />
            <div className="feedback-actions">
              <button className="fb-submit" onClick={handleSendFeedback} disabled={isSendingFeedback}>
                {isSendingFeedback ? '送信中...' : UI_TEXT.FEEDBACK_SUBMIT}
              </button>
              <button className="fb-cancel" onClick={() => setIsFeedbackOpen(false)}>
                {UI_TEXT.FEEDBACK_CANCEL}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
