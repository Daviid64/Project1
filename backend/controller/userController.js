import UserService from '../services/UserService.js';

const userController = {

  register: async (req, res) => {
    try {
      const { agency_id } = req.body;

      if (!agency_id) {
        return res.status(400).json({ success: false, message: "Requête invalide" });
      }

      const { userId } = await UserService.createUser(req.body);

      return res.status(201).json({
        success: true,
        message: "Utilisateur créé",
        userId
      });

    } catch (error) {
      return res.status(400).json({ success: false, message: "Impossible d'effectuer l'opération" });
    }
  },



  verify: async (req, res) => {
    try {
      const verified = await UserService.verifyUserByToken(req.params.token);
      if (!verified) return res.status(400).json({ success: false, message: "Requête invalide" });

      return res.status(200).json({ success: true, message: "Compte vérifié" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erreur interne" });
    }
  },



  findByEmail: async (req, res) => {
    try {
      const { email } = req.query;
      const user = await UserService.findUserByEmail(email);
      if (!user) return res.status(404).json({ success: false, message: "Aucun résultat" });

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Requête invalide" });
    }
  },



  getAll: async (req, res) => {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Impossible de récupérer les données" });
    }
  },



  getById: async (req, res) => {
    try {
      const user = await UserService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "Aucun résultat" });

      return res.status(200).json({ success: true, user });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Requête invalide" });
    }
  },



  deleteById: async (req, res) => {
    try {
      const deleted = await UserService.deleteUserById(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: "Aucun résultat" });

      return res.status(200).json({ success: true, message: "Suppression effectuée" });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Impossible d'effectuer l'opération" });
    }
  },



  deleteAll: async (req, res) => {
    try {
      const deleted = await UserService.deleteAllUsers();
      return res.status(200).json({ success: true, deleted });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Impossible d'effectuer l'opération" });
    }
  },



  updateById: async (req, res) => {
    try {
      const updated = await UserService.updateUserById(req.body, req.params.id);
      if (!updated) return res.status(404).json({ success: false, message: "Aucun résultat" });

      return res.status(200).json({ success: true, message: "Mise à jour effectuée" });
    } catch (error) {
      return res.status(400).json({ success: false, message: "Impossible d'effectuer l'opération" });
    }
  }

};

export default userController;
