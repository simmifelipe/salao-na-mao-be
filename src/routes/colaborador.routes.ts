import express from "express";
import { connection } from "mongoose";

const router = express.Router();
import pagarme from "../services/pagarme";

import ColaboradorModel from "../models/colaborador";
import SalaoColaboradorModel from "../models/relationship/salaoColaborador";
import ColaboradorServicoModel from "../models/relationship/colaboradorServico";

router.post("/", async (req, res) => {
  const db = connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { colaborador, salaoId } = req.body;
    let newColaborador = null;

    // Verificar se o colaborador existe
    const existentColaborador = await ColaboradorModel.findOne({
      $or: [
        {
          email: colaborador.email,
        },
        {
          telefone: colaborador.telefone,
        },
      ],
    });

    if (!existentColaborador) {
      // Criar conta bancária
      const { contaBancaria } = colaborador;
      const pagarmeBanckAccount = await pagarme("bank_accounts", {
        agencia: contaBancaria.agencia,
        bank_code: contaBancaria.banco,
        conta: contaBancaria.numero,
        conta_dv: contaBancaria.dv,
        type: contaBancaria.tipo,
        document_number: contaBancaria.cpfCnpj,
        legal_name: contaBancaria.titular,
      });

      if (pagarmeBanckAccount.error) {
        throw pagarmeBanckAccount;
      }

      // Criar recebedor
      const pagarmeRecipient = await pagarme("recipients", {
        transfer_interval: "daily",
        transfer_enabled: true,
        bank_account_id: pagarmeBanckAccount.data.id,
      });

      if (pagarmeRecipient.error) {
        throw pagarmeRecipient;
      }

      // Criar colaborador
      newColaborador = await new ColaboradorModel({
        ...colaborador,
        recipientId: pagarmeRecipient.data.id,
      }).save({ session });
    }

    // Relacionamento
    const colaboradorId = existentColaborador
      ? existentColaborador._id
      : newColaborador._id;

    // Verifica se já exite o relacionamento com o salão
    const existentRelationship = await SalaoColaboradorModel.findOne({
      salaoId,
      colaboradorId,
      status: { $ne: "E" },
    });

    // Se não está vinculado
    if (!existentRelationship) {
      await new SalaoColaboradorModel({
        salaoId,
        colaboradorId,
        status: colaborador.vinculo,
      }).save({ session });
    }

    // Se já esxistir um vinculo entre salão e colaborador
    if (existentColaborador) {
      await SalaoColaboradorModel.findOneAndUpdate(
        {
          salaoId,
          colaboradorId,
        },
        { status: colaborador.vinculo },
        { session }
      );
    }

    // Relação com as especialidades(serviços)

    await ColaboradorServicoModel.insertMany(
      colaborador.especialidades.map(
        (servicoId) => ({
          servicoId,
          colaboradorId,
        }),
        { session }
      )
    );

    await session.commitTransaction();
    session.endSession();

    if (existentColaborador && existentRelationship) {
      res.json({ error: true, message: "Colaborador já cadastrado" });
    } else {
      res.json({ error: false });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.put("/:colaboradorId", async (req, res) => {
  try {
    const { vinculo, vinculoId, especialidades } = req.body;
    const { colaboradorId } = req.params;

    // Vinculo
    await SalaoColaboradorModel.findByIdAndUpdate(vinculoId, {
      status: vinculo,
    });

    // Especialidades
    await ColaboradorServicoModel.deleteMany({
      colaboradorId,
    });

    await ColaboradorServicoModel.insertMany(
      especialidades.map((servicoId) => ({
        servicoId,
        colaboradorId,
      }))
    );

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete("/vinculo/:id", async (req, res) => {
  try {
    await SalaoColaboradorModel.findByIdAndUpdate(req.params.id, {
      status: "E",
    });

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post("/filter", async (req, res) => {
  try {
    const colaboradores = await ColaboradorModel.find(req.body.filters);

    res.json({ error: false, colaboradores });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;
    let listaColaboradores = [];

    // Recuperar vinculos
    const salaoColaboradores: any = await SalaoColaboradorModel.find({
      salaoId,
      status: { $ne: "E" },
    }).populate({ path: "colaboradorId", select: "-senha -recipientId" });

    for (let vinculo of salaoColaboradores) {
      const especialidades: any = await ColaboradorServicoModel.find({
        colaboradorId: vinculo.colaboradorId._id,
      });

      listaColaboradores.push({
        ...vinculo._doc,
        especialidades: especialidades.map(especialidade => especialidade.servicoId),
      });
    }

    res.json({
      error: false,
      colaboradores: listaColaboradores.map((vinculo) => ({
        ...vinculo.colaboradorId._doc,
        vinculoId: vinculo._id,
        status: vinculo.status,
        especialidades: vinculo.especialidades,
        dataCadastro: vinculo.dataCadastro,
      })),
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

export default router;
