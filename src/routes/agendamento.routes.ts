import express, { Request, Response } from "express";
import mongoose from "mongoose";
import moment from "moment";
import _ from "lodash";

import {
  SLOT_DURATION,
  hourToMinuts,
  mergeDateTime,
  sliceMinutes,
  splitByValue,
  toCents,
} from "../util";
import keys from "../data/keys.json";
import pagarme from "../services/pagarme";

import ClienteModel from "../models/cliente";
import SalaoModel from "../models/salao";
import ServicoModel from "../models/servico";
import ColaboradorModel from "../models/colaborador";
import AgendamentoModel from "../models/agendamento";
import HorarioModel from "../models/horario";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const db = mongoose.connection;
  const session = await db.startSession();
  session.startTransaction();

  try {
    const { clienteId, salaoId, servicoId, colaboradorId } = req.body;

    // Recuperar o cliente
    const cliente = await ClienteModel.findById(clienteId).select(
      "nome endereco customerId"
    );

    // Recuperar o salão
    const salao = await SalaoModel.findById(salaoId).select("recipientId");

    // Recuperar o serviço
    const servico = await ServicoModel.findById(servicoId).select(
      "preco titulo comissao"
    );

    // Recuperar o colaborador
    const colaborador = await ColaboradorModel.findById(colaboradorId).select(
      "recipientId"
    );

    // Criando pagamento
    const precoFinal = toCents(servico.preco) * 100;

    // Colaborador split rules
    const colaboradorSplitRule = {
      recipient_id: colaborador.recipientId,
      amount: precoFinal * (servico.comissao / 100),
    };

    const createPayment = await pagarme("/transactions", {
      // Preço total
      amount: precoFinal,

      // Dados do cartão
      card_number: "4111111111111111",
      card_cvv: "123",
      card_expiration_date: "0922",
      card_holder_name: "Morpheus Fishburne",

      // Dados do cliente
      customer: {
        id: cliente.customerId,
      },

      // Dados de endereco do cliente
      billing: {
        name: cliente.nome,
        address: {
          country: cliente.endereco.pais,
          state: cliente.endereco.uf,
          city: cliente.endereco.cidade,
          street: cliente.endereco.logradouro,
          street_number: cliente.endereco.numero,
          zipcode: cliente.endereco.cep,
        },
      },

      // Itens da venda
      items: [
        {
          id: servicoId,
          title: servico.titulo,
          unit_price: precoFinal,
          quantity: 1,
          tangible: false,
        },
      ],
      split_rules: [
        // Taxa do salão
        {
          recipient_id: salao.recipientId,
          amount: precoFinal - keys.app_fee - colaboradorSplitRule.amount,
        },
        colaboradorSplitRule,
        {
          recipient_id: keys.recipient_id,
          amount: keys.app_fee,
        },
      ],
    });

    if (createPayment.error) {
      throw createPayment;
    }

    // Criar agendamento
    const agendamento = await new AgendamentoModel({
      ...req.body,
      transactionId: createPayment.data.id,
      comissao: servico.comissao,
      valor: servico.preco,
    }).save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ error: false, agendamento });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.json({ error: true, message: err.message });
  }
});

router.post("/filter", async (req: Request, res: Response) => {
  try {
    const { periodo, salaoId } = req.body;

    const agendamentos = await AgendamentoModel.find({
      salaoId,
      data: {
        $gte: moment(periodo.inicio).startOf("day"),
        $lte: moment(periodo.final).endOf("day"),
      },
    }).populate([
      { path: "servicoId", select: "titulo duracao" },
      { path: "colaboradorId", select: "nome" },
      { path: "clienteId", select: "nome" },
    ]);

    res.json({ error: false, agendamentos });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

router.post("/dias-disponiveis", async (req: Request, res: Response) => {
  try {
    const { data, salaoId, servicoId } = req.body;
    const horarios = await HorarioModel.find({ salaoId });
    const servico = await ServicoModel.findById(servicoId).select("duracao");

    let agenda = [];
    let colaboradores: any = [];
    let lastDay = moment(data);

    // Duração do serviço
    const servicoMinutos = hourToMinuts(
      moment(servico.duracao).format("HH:mm")
    );

    const servicoSlots = sliceMinutes(
      servico.duracao,
      moment(servico.duracao).add(servicoMinutos, "minutes"),
      SLOT_DURATION
    ).length;

    // Procure nos próximos 365 até a agenda conter 7 dias disponíveis
    for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
      const espacosValidos = horarios.filter((h) => {
        // Verificar o dia da semana
        const diaSemanaDisponivel = h.dias.includes(moment(lastDay).day());

        // Verificar especialidade disponível
        const servicoDisponivel = h.especialidades.includes(servicoId);

        return diaSemanaDisponivel && servicoDisponivel;
      });

      // Todos os colaboradores disponíveis no dia e seus horários
      if (espacosValidos.length > 0) {
        let todosHorariosDia = {};

        for (let spaco of espacosValidos) {
          for (let colaboradorId of spaco.colaboradores) {
            if (!todosHorariosDia[colaboradorId]) {
              todosHorariosDia[colaboradorId] = [];
            }

            // Pegar todos os horarios do espaco e jogar para dentro do colaborador
            todosHorariosDia[colaboradorId] = [
              ...todosHorariosDia[colaboradorId],
              ...sliceMinutes(
                mergeDateTime(lastDay, spaco.inicio),
                mergeDateTime(lastDay, spaco.fim),
                SLOT_DURATION
              ),
            ];
          }
        }

        // Verificar ocupação de cada especialista no dia
        for (let colaboradorId of Object.keys(todosHorariosDia)) {
          // Recuperar agendamentos
          const agendamentos = await AgendamentoModel.find({
            colaboradorId,
            data: {
              $gte: moment(lastDay).startOf("day"),
              $lte: moment(lastDay).endOf("day"),
            },
          })
            .select("data servicoId -_id")
            .populate("servicoId", "duracao");

          // Recuperar os horarios agendados
          let horariosOcupados: any = agendamentos.map((agendamento) => ({
            inicio: moment(agendamento.data),
            final: moment(agendamento.data).add(
              hourToMinuts(
                moment(agendamento.servicoId.duracao).format("HH:mm")
              ),
              "minutes"
            ),
          }));

          // Recuperar todos os slots entre os agendamentos
          horariosOcupados = horariosOcupados
            .map((horario: any) =>
              sliceMinutes(horario.inicio, horario.final, SLOT_DURATION)
            )
            .flat();

          // Removendo todos os slots ocupados
          let horariosLivres: any = splitByValue(
            todosHorariosDia[colaboradorId].map((horarioLivre) => {
              return horariosOcupados.includes(horarioLivre)
                ? "-"
                : horarioLivre;
            }),
            "-"
          ).filter((space) => space.length > 0);

          // Verificando se existe espaço suficiente no slot
          horariosLivres = horariosLivres.filter(
            (horarios) => horarios.length >= servicoSlots
          );

          // Verificando se os horarios dentro do slot tem o tamanho necessário
          horariosLivres = horariosLivres
            .map((slot: any) =>
              slot.filter(
                (horario, index) => slot.length - index >= servicoSlots
              )
            )
            .flat();

          // Formatando os horarios de 2 em 2
          horariosLivres = _.chunk(horariosLivres, 2);

          // Remover colaborador caso não tenha nenhum espaço disponível
          if (horariosLivres.length === 0) {
            todosHorariosDia = _.omit(todosHorariosDia, colaboradorId);
          } else {
            todosHorariosDia[colaboradorId] = horariosLivres;
          }
        }

        // Verificar se há especialista disponível naquele dia
        const totalEspecialistas = Object.keys(todosHorariosDia).length;

        if (totalEspecialistas > 0) {
          colaboradores.push(Object.keys(todosHorariosDia));
          agenda.push({
            [lastDay.format("YYYY-MM-DD")]: todosHorariosDia,
          });
        }
      }

      lastDay = lastDay.add(1, "day");
    }

    colaboradores = _.uniq(colaboradores.flat());

    colaboradores = await ColaboradorModel.find({
      _id: { $in: colaboradores },
    }).select("nome foto");

    colaboradores = colaboradores.map((c) => ({
      ...c._doc,
      nome: c.nome.split(" ")[0],
    }));

    res.json({ error: false, colaboradores, agenda });
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

export default router;
