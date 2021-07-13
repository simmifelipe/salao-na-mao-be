import express from "express";
import _ from "lodash";

const router = express.Router();

import HorarioModel from "../models/horario";
import ColaboradorServicoModel from "../models/relationship/colaboradorServico";

router.post("/", async (req, res) => {
  try {
    const horario = await new HorarioModel(req.body).save();

    res.json({ error: false, horario });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;
    const horarios = await HorarioModel.find({
      salaoId,
    });

    res.json({ error: false, horarios });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.put("/:horarioId", async (req, res) => {
  try {
    const { horarioId } = req.params;
    const horario = req.body;

    await HorarioModel.findByIdAndUpdate(horarioId, horario);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete("/:horarioId", async (req, res) => {
  try {
    const { horarioId } = req.params;

    await HorarioModel.findByIdAndDelete(horarioId);

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post("/colaboradores", async (req, res) => {
  try {
    const colaboradorServico = await ColaboradorServicoModel.find({
      servicoId: {
        $in: req.body.especialidades,
      },
      status: "A",
    })
      .populate("colaboradorId", "nome")
      .select("colaboradorId -_id");

    const colaboradores = _.uniqBy(colaboradorServico, (vinculo: any) =>
      vinculo.colaboradorId._id.toString()
    ).map((vinculo) => ({
      label: vinculo.colaboradorId.nome,
      value: vinculo.colaboradorId._id,
    }));

    res.json({
      error: false,
      colaboradores,
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

export default router;
