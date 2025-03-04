import path from 'node:path'
import process from 'node:process'
import cors from 'cors'
import express from 'express'
import hljs from 'highlight.js'
import { DataTypes, Sequelize } from 'sequelize'

const app = express()
app.use(cors())
app.use(express.json())

// 配置数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(process.cwd(), 'my-server/database.sqlite'),
})

// 定义数据模型
const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  scratchpad: DataTypes.BOOLEAN,
  favorite: DataTypes.BOOLEAN,
  trash: DataTypes.BOOLEAN,
  category: DataTypes.STRING,
}, {
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

const Setting = sequelize.define('Setting', {
  key: { type: DataTypes.STRING, unique: true },
  value: DataTypes.TEXT,
})

const validSettings = {
  darkTheme: 'false',
  isPreviewMode: 'false',
}

// 初始化数据库
sequelize.sync({ force: false }).then(async () => {
  for (const [key, value] of Object.entries(validSettings)) {
    await Setting.findOrCreate({
      where: { key },
      defaults: { value },
    })
  }
})

// 在server.js的接口定义之前添加
app.get('/', (req, res) => {
  res.send(`
    <h1>Server is running</h1>
    <p>Available endpoints:</p>
    <ul>
      <li>GET /api/notes</li>
      <li>POST /api/notes</li>
      <li>GET /api/settings/:key</li>
      <li>POST /api/detect-language</li>
    </ul>
  `)
})

// Notes接口
// 获取notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.findAll()
    res.json(notes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
// 创建note
app.post('/api/notes', async (req, res) => {
  try {
    const note = await Note.create(req.body)
    res.status(201).json(note)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
// 更新note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const [updated] = await Note.update(req.body, {
      where: { id: req.params.id },
    })
    if (updated) {
      const updateNote = await Note.findByPk(req.params.id)
      res.json(updateNote)
    } else {
      res.status(404).json({ error: 'Note not found' })
    }
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})
// 删除note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const deleted = await Note.destroy({
      where: { id: req.params.id },
    })
    if (deleted) {
      res.status(204).end()
    } else {
      res.status(404).json({ error: 'Note not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Settings接口
// 获取settings
app.get('/api/settings/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({
      where: { key: req.params.key },
    })
    if (!setting
      && Object.prototype.hasOwnProperty.call(validSettings, req.params.key)) {
      return res.json({
        key: req.params.key,
        value: validSettings[req.params.key],
      })
    }
    res.json(setting || {
      key: req.params.key,
      value: validSettings[req.params.key] || 'false',
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
// 更新setting
app.post('/api/settings', async (req, res) => {
  try {
    const { key, value } = req.body
    if (!Object.prototype.hasOwnProperty.call(validSettings, key)) {
      return res.status(400).json({ error: 'Invalid setting key' })
    }

    const [setting] = await Setting.upsert({
      key,
      value,
    })

    res.json({
      key: setting.key,
      value: setting.value,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// 编程语言检测接口
app.post('/api/detect-language', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ error: 'Code text is required' })
    }

    const result = hljs.highlightAuto(code)
    res.json({
      language: result.language || 'unknown',
      relevance: result.relevance,
      value: result.value,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 错误处理中间件
// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// 全局错误处理
app.use((err, req, res) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// 监听端口
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
