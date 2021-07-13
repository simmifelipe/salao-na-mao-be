import express from "express";
const router = express.Router();
import Busboy from "busboy";

import { uploadToS3, deleteFileS3 } from "../services/aws";
import ServicoModel from "../models/servico";
import ArquivoModel from "../models/arquivo";

router.post("/", async (req: any, res: any) => {
  let busboy = new Busboy({
    headers: req.headers,
  });
  busboy.on("finish", async () => {
    try {
      const { salaoId, servico } = req.body;
      let errors = [];
      let arquivos = [];

      if (req.files && Object.keys(req.files).length > 0) {
        for (let key of Object.keys(req.files)) {
          const file = req.files[key];

          const nameParts = file.name.split(".");
          const fileName = `${new Date().getTime()}.${nameParts[nameParts.length - 1]
            }`;
          const path = `servicos/${salaoId}/${fileName}`;

          const response: any = await uploadToS3(file, path);

          if (response.error) {
            errors.push({ error: true, message: response.message });
          } else {
            arquivos.push(path);
          }
        }
      }

      if (errors.length > 0) {
        res.json(errors[0]);
        return false;
      }

      // criar serviço
      let jsonServico = JSON.parse(servico);
      const servicoCadastrado = await new ServicoModel(jsonServico).save();

      arquivos = arquivos.map((arquivo) => ({
        referenciaId: servicoCadastrado._id,
        model: "Servico",
        caminho: arquivo,
      }));

      await ArquivoModel.insertMany(arquivos);

      res.json({ error: false, servico: servicoCadastrado, arquivos });
    } catch (err) {
      res.json({ error: true, message: err.message });
    }
  });
  req.pipe(busboy);
});

router.put("/:id", async (req: any, res: any) => {
  let busboy = new Busboy({
    headers: req.headers,
  });
  busboy.on("finish", async () => {
    try {
      const { salaoId, servico } = req.body;
      let errors = [];
      let arquivos = [];

      if (req.files && Object.keys(req.files).length > 0) {
        for (let key of Object.keys(req.files)) {
          const file = req.files[key];

          const nameParts = file.name.split(".");
          const fileName = `${new Date().getTime()}.${nameParts[nameParts.length - 1]
            }`;
          const path = `servicos/${salaoId}/${fileName}`;

          const response: any = await uploadToS3(file, path);

          if (response.error) {
            errors.push({ error: true, message: response.message });
          } else {
            arquivos.push(path);
          }
        }
      }

      if (errors.length > 0) {
        res.json(errors[0]);
        return false;
      }

      // criar serviço
      const jsonServico = JSON.parse(servico);
      await ServicoModel.findByIdAndUpdate(req.params.id, jsonServico);

      arquivos = arquivos.map((arquivo) => ({
        referenciaId: req.params.id,
        model: "Servico",
        caminho: arquivo,
      }));

      await ArquivoModel.insertMany(arquivos);

      res.json({ error: false });
    } catch (err) {
      res.json({ error: true, message: err.message });
    }
  });
  req.pipe(busboy);
});

router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;

    let servicosSalao = [];
    const servicos: any = await ServicoModel.find({
      salaoId,
      status: { $ne: "E" },
    });

    for (let servico of servicos) {
      const arquivos = await ArquivoModel.find({
        model: "Servico",
        referenciaId: servico._id,
      });
      servicosSalao.push({ ...servico._doc, arquivos });
    }

    res.json({ error: false, servicos: servicosSalao });
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

router.delete("/delete-arquivo/:key", async (req, res) => {
  try {
    const { key } = req.params;

    await deleteFileS3(key);

    await ArquivoModel.findOneAndDelete({
      caminho: key,
    });

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await ServicoModel.findByIdAndUpdate(id, { status: "E" });

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

export default router;
