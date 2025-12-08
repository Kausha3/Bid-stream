import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

// GET /api/expenses - Get all expenses with optional filters
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, category, type } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.json({
      success: true,
      data: { expenses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses'
    });
  }
});

// GET /api/expenses/summary - Get aggregated summary
router.get('/summary', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Get date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Aggregate by category
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate },
          type: 'expense'
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Aggregate by day for trend chart
    const dailyTrend = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Calculate totals
    const totals = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = totals.find(t => t._id === 'expense')?.total || 0;
    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;

    res.json({
      success: true,
      data: {
        categoryBreakdown,
        dailyTrend,
        totals: {
          expenses: totalExpenses,
          income: totalIncome,
          balance: totalIncome - totalExpenses
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching summary'
    });
  }
});

// POST /api/expenses - Create new expense
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();

    res.status(201).json({
      success: true,
      data: { expense }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating expense'
    });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense'
    });
  }
});

export default router;
