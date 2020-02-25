import User from '../models/User';

export default async (req, res, next) => {
  const { admin } = await User.findByPk(req.userId);

  if (!admin) {
    return res
      .status(401)
      .json({ error: 'Only administrators can perform this action' });
  }

  return next();
};
