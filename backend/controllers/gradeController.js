import fs from "fs";
import path from "path";
import parse from "csv-parser";
import { gradeModel } from "../models/index.js";
import { logger } from "../config/logger.js";

const create = async (req, res) => {
  const { name, subject, type, value } = req.body;
  try {
    await gradeModel.create(
      {
        name,
        subject,
        type,
        value,
        lastModified: new Date(),
      },
      (err, grade) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.status(202).json(grade);
      }
    );
    logger.info(`POST /grade - ${JSON.stringify()}`);
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message || "Algum erro ocorreu ao salvar" });
    logger.error(`POST /grade - ${JSON.stringify(error.message)}`);
  }
};

const findAll = async (req, res) => {
  const name = req.query.name;

  //condicao para o filtro no findAll
  var condition = name
    ? { name: { $regex: new RegExp(name), $options: "i" } }
    : {};

  try {
    await gradeModel.find(condition, (err, grades) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(202).json(grades);
    });
    logger.info(`GET /grade`);
  } catch (error) {
    res
      .status(500)
      .send({ message: error.message || "Erro ao listar todos os documentos" });
    logger.error(`GET /grade - ${JSON.stringify(error.message)}`);
  }
};

const findOne = async (req, res) => {
  const id = req.params.id;

  try {
    await gradeModel.findOne({ _id: id }, (err, grade) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(202).json(grade);
    });

    logger.info(`GET /grade - ${id}`);
  } catch (error) {
    res.status(500).send({ message: "Erro ao buscar o Grade id: " + id });
    logger.error(`GET /grade - ${JSON.stringify(error.message)}`);
  }
};

const update = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Dados para atualizacao vazio",
    });
  }

  const { name, subject, type, value } = req.body;
  const id = req.params.id;

  try {
    await gradeModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          subject,
          type,
          value,
          lastModified: new Date(),
        },
      },
      { useFindAndModify: true, new: true },
      (err, grade) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res
          .status(202)
          .json({ message: "Grade atualizado com sucesso", grade });
      }
    );

    logger.info(`PUT /grade - ${id} - ${JSON.stringify(req.body)}`);
  } catch (error) {
    res.status(500).send({ message: "Erro ao atualizar a Grade id: " + id });
    logger.error(`PUT /grade - ${JSON.stringify(error.message)}`);
  }
};

const remove = async (req, res) => {
  const id = req.params.id;

  try {
    await gradeModel.deleteOne({ _id: id }, (err, grade) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.send({ message: `Grade ${id} excluido com sucesso` });
    });

    logger.info(`DELETE /grade - ${id}`);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Nao foi possivel deletar o Grade id: " + id });
    logger.error(`DELETE /grade - ${JSON.stringify(error.message)}`);
  }
};

const removeAll = async (req, res) => {
  try {
    const deleted = await gradeModel.deleteMany();
    res.send({
      message: `${deleted.deletedCount} grades excluidas`,
    });
    logger.info(`DELETE /grade`);
  } catch (error) {
    res.status(500).send({ message: "Erro ao excluir todos as Grades" });
    logger.error(`DELETE /grade - ${JSON.stringify(error.message)}`);
  }
};

const importCsv = (req, res) => {
  const gradesCsvPath = path.resolve(path.resolve(), "database", "grades.csv");
  const csvData = [];
  fs.createReadStream(gradesCsvPath)
    .pipe(parse({ delimiter: ":" }))
    .on("data", function (csvrow) {
      csvData.push(csvrow);
    })
    .on("end", async function () {
      await gradeModel.insertMany(csvData, (err, grades) => {
        if (err) {
          res.send(err);
        }
        res.send(grades);
      });
    });
};

export default {
  create,
  findAll,
  findOne,
  update,
  remove,
  removeAll,
  importCsv,
};
