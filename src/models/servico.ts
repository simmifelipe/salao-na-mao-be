import { Schema, Types, model } from "mongoose";

export type Servico = {
  salaoId: string;
  titulo: string;
  preco: number;
  comissao: number;
  duracao: Date;
  recorrencia: number;
  descricao: string;
  status: string;
  dataCadastro: Date;
};

const servico = new Schema<Servico>({
  salaoId: {
    type: Types.ObjectId,
    ref: "Salao",
  },
  titulo: {
    type: String,
    required: true,
  },
  preco: {
    type: Number,
    required: true,
  },
  comissao: {
    type: Number,
    required: true,
  },
  duracao: {
    type: Date,
    required: true,
  },
  recorrencia: {
    type: Number,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I", "E"],
    required: true,
    default: "A",
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model<Servico>("Servico", servico);
