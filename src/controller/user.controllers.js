import { ObjectId } from 'mongodb'
import bcrypt from 'bcrypt'
import { User, validate } from '../models/user.model.js'
import Jwt from 'jsonwebtoken';
const jwtPrivateKey = 'chatAppPrivateKey';

const checkPseudoInUse = async (pseudo) => {
  let result = await User.findOne({ pseudo: pseudo })
  return result ? true : false
}

const create = async (req, res) => {
  let status;
  let response = {
    success: false,
    message: ''
  }

  try {
    const { error } = validate(req.body)

    if (error) {
      status = 400
      response.message = error.details[0].message
    } else {
      const isPseudoInUse = await checkPseudoInUse(req.body.pseudo)
      if (isPseudoInUse) {
        status = 400
        response.message = 'This "Pseudo" is already picked'
      } else {
        let user = new User({
          pseudo: req.body.pseudo,
          password: req.body.password
        })
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        await user.save()
        status = 200
        response.success = true
        response.message = 'User created'
      }
    }
  } catch (err) {
    status = 500
    response.message = err.message
  }
  res.status(status).json(response)
}

const get_all = async (req, res) => {
  let status;
  let response = {
    success: false,
    data: [],
    message: ''
  }

  try {
    response.data = await User.find();
    status = 200;
    response.success = true
  } catch (err) {
    status = 500
    response.message = err.message
  }
  res.status(status).json(response);
}

const get_by_id = async (req, res) => {
  let status;
  let response = {
    success: false,
    data: [],
    message: ''
  }

  try {
    if (ObjectId.isValid(req.params.id)) {
      let result = await User.findById(req.params.id);

      if (!result) {
        status = 404
        response.message = 'User not found'
      } else {
        status = 200
        response.success = true
        response.data = result
      };
    } else {
      status = 404
      response.message = 'Not a valid Id'
    }
  }
  catch (err) {
    status = 500
    response.message = err.message
  }
  res.status(status).json(response);
}

const updateOne = async (req, res) => {
  let status;
  let response = {
    success: false,
    message: ''
  }

  try {
    if (ObjectId.isValid(req.params.id)) {
      const { error } = validate(req.body)
      if (error) {
        status = 400
        response.message = error.details[0].message
      } else {
        const query = { _id: new ObjectId(req.params.id) };

        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)

        const updates = {
          $set: {
            pseudo: req.body.pseudo,
            password: req.body.password
          },
        };

        let result = await User.updateOne(query, updates);
        if (result.matchedCount == 0) {
          status = 404
          response.message = 'User not found'
        } else {
          status = 200
          response.success = true
          response.message = 'User updated successfully'
        };
      }
    } else {
      status = 404
      response.message = 'Not a valid Id'
    }
  } catch (err) {
    status = 500
    response.message = err.message
  }
  res.status(status).json(response);
}

const deleteOne = async (req, res) => {
  let status;
  let response = {
    success: false,
    message: ''
  }
  try {
    if (ObjectId.isValid(req.params.id)) {
      const db = getDb()
      const query = { _id: new ObjectId(req.params.id) };

      let result = await User.deleteOne(query);
      if (result.deletedCount == 0) {
        status = 404
        response.message = 'User not found'
      } else {
        status = 200
        response.success = true
        response.message = 'User deleted successfully'
      };
    } else {
      status = 404
      response.message = 'Not a valid Id'
    }
  } catch (err) {
    status = 500
    response.message = err.message
  }
  res.status(status).json(response);
}

const checkUser = async (req, res) => {
  let status;
  let response = {
    success: false,
    message: ''
  }
  const token = req.header('x-auth-token');
  try {
    const decoded = Jwt.verify(token, jwtPrivateKey);
    let result = await User.findById(new ObjectId(decoded._id))

    if (!result) {
      status = 404
      response.message = 'User not found'
    } else {
      status = 200
      response.success = true
    };
  } catch (err) {
    status = 500
    response.message = err.message
  }
  res.status(status).json(response)
}

export {
  create,
  get_all,
  get_by_id,
  updateOne,
  deleteOne,
  checkUser
}