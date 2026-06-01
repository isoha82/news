const userService = require('../services/user.service');

const VALID_THEMES = ['light', 'dark'];

async function getMe(req, res) {
  try {
    const user = await userService.getMe(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('[user] getMe:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteMe(req, res) {
  try {
    const deleted = await userService.deleteMe(req.user.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.status(204).end();
  } catch (err) {
    console.error('[user] deleteMe:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getSettings(req, res) {
  try {
    const result = await userService.getSettings(req.user.id);
    res.json(result);
  } catch (err) {
    console.error('[user] getSettings:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateTheme(req, res) {
  try {
    const { theme } = req.body;
    if (!theme || !VALID_THEMES.includes(theme)) {
      return res.status(400).json({ error: `theme must be one of: ${VALID_THEMES.join(', ')}` });
    }
    const result = await userService.updateTheme(req.user.id, theme);
    res.json(result);
  } catch (err) {
    console.error('[user] updateTheme:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateCountries(req, res) {
  try {
    const { country_ids } = req.body;
    if (!Array.isArray(country_ids) || country_ids.length === 0) {
      return res.status(400).json({ error: 'country_ids must be a non-empty array' });
    }
    const result = await userService.updateCountries(req.user.id, country_ids);
    res.json(result);
  } catch (err) {
    console.error('[user] updateCountries:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateCategories(req, res) {
  try {
    const { category_ids } = req.body;
    if (!Array.isArray(category_ids) || category_ids.length === 0) {
      return res.status(400).json({ error: 'category_ids must be a non-empty array' });
    }
    const result = await userService.updateCategories(req.user.id, category_ids);
    res.json(result);
  } catch (err) {
    console.error('[user] updateCategories:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateNotificationSettings(req, res) {
  try {
    const { session_update, hot_issue, scrap_comment } = req.body;
    if ([session_update, hot_issue, scrap_comment].some(v => typeof v !== 'boolean')) {
      return res.status(400).json({ error: 'session_update, hot_issue, scrap_comment must all be booleans' });
    }
    const result = await userService.updateNotificationSettings(req.user.id, { session_update, hot_issue, scrap_comment });
    res.json(result);
  } catch (err) {
    console.error('[user] updateNotificationSettings:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getMe, deleteMe, getSettings, updateTheme, updateCountries, updateCategories, updateNotificationSettings };
