import express from "express";
import mongoose from "mongoose";

const router = express.Router();
import pagarme from "../services/pagarme";

import ClienteModel from "../models/cliente";
import SalaoCliente from "../models/relationship/salaoCliente";

router.post("/", async (req, res) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { cliente, salaoId } = req.body;
    let newCliente = null;

    // Verificar se o cliente existe
    const existentCliente = await ClienteModel.findOne({
      $or: [
        {
          email: cliente.email,
        },
        {
          telefone: cliente.telefone,
        },
      ],
    });

    if (!existentCliente) {
      const _id = mongoose.Types.ObjectId();

      // Criar customer
      const pagarmeCustomer = await pagarme("/customers", {
        external_id: _id,
        name: cliente.nome,
        type: cliente.documento.tipo === "cpf" ? "individual" : "corporation",
        country: cliente.endereco.pais,
        email: cliente.email,
        documents: [
          {
            type: cliente.documento.tipo,
            number: cliente.documento.numero,
          },
        ],
        phone_numbers: [cliente.telefone],
        birthday: cliente.dataNascimento,
      });

      if (pagarmeCustomer.error) {
        throw pagarmeCustomer;
      }

      // Criar cliente
      newCliente = await new ClienteModel({
        ...cliente,
        _id,
        customerId: pagarmeCustomer.data.id,
      }).save({ session });
    }

    // Relacionamento
    const clienteId = existentCliente ? existentCliente._id : newCliente._id;

    // Verifica se já exite o relacionamento com o salão
    const existentRelationship = await SalaoCliente.findOne({
      salaoId,
      clienteId,
      status: { $ne: "E" },
    });

    // Se não está vinculado
    if (!existentRelationship) {
      await new SalaoCliente({
        salaoId,
        clienteId,
      }).save({ session });
    }

    // Se já esxistir um vinculo entre cliente e salão
    if (existentRelationship) {
      await SalaoCliente.findOneAndUpdate(
        {
          salaoId,
          clienteId,
        },
        { status: "A" },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    if (existentCliente && existentRelationship) {
      res.json({ error: true, message: "Cliente já cadastrado" });
    } else {
      res.json({ error: false });
    }
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.post("/filter", async (req, res) => {
  try {
    const clientes = await ClienteModel.find(req.body.filters);

    res.json({ error: false, clientes });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.get("/salao/:salaoId", async (req, res) => {
  try {
    const { salaoId } = req.params;

    // Recuperar vinculos
    let clientes = await SalaoCliente.find({
      salaoId,
      status: { $ne: "E" },
    })
      .populate("clienteId")
      .select("clienteId");

    clientes = clientes.map((vinculo) => {
      return {
        ...vinculo.clienteId._doc,
        vinculoId: vinculo._id,
      };
    });

    res.json({
      error: false,
      clientes,
    });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.delete("/vinculo/:id", async (req, res) => {
  try {
    await SalaoCliente.findByIdAndUpdate(req.params.id, { status: "E" });

    res.json({ error: false });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

export default router;
