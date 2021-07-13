import { Schema, Types, model } from "mongoose";

export type Agendamento = {
  clienteId: string;
  salaoId: string;
  servicoId: string;
  colaboradorId: string;
  data: Date;
  comissao: number;
  valor: number;
  transactionId: string;
  dataCadastro: Date;
};

const agendamento = new Schema<Agendamento>({
  clienteId: {
    type: Types.ObjectId,
    ref: "Cliente",
    required: true,
  },
  salaoId: {
    type: Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  servicoId: {
    type: Types.ObjectId,
    ref: "Servico",
    required: true,
  },
  colaboradorId: {
    type: Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },
  data: {
    type: Date,
    required: true,
  },
  comissao: {
    type: Number,
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: Number,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model<any>("Agendamento", agendamento);
