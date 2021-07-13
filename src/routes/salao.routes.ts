import express from "express";
import turf from "@turf/turf";
const router = express.Router();

import SalaoModel from "../models/salao";
import ServicoModel from "../models/servico";

router.post("/", async (req, res) => {
  try {
    const salao = await new SalaoModel(req.body).save();
    res.json({ error: false, salao });
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

router.get("/servicos/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;

    const servicos = await ServicoModel.find({
      salaoId,
      status: "A",
    }).select("_id titulo");

    res.json({
      error: false,
      servicos: servicos.map((s) => ({ label: s.titulo, value: s._id })),
    });
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const salao = await SalaoModel.findById(id).select(
      "capa nome endereco.cidade geo.coordinates telefone"
    );

    // Distância
    const distance = turf.distance(
      turf.point(salao.geo.coordinates),
      turf.point([-30.043858, -51.103187])
    );

    res.json({
      error: false,
      salao,
      distance,
    });
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

export default router;
