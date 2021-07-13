import { Schema, Types, model } from "mongoose";

type ColaboradorServico = {
  colaboradorId: string;
  servicoId: string;
  status: string;
  dataCadastro: Date;
}

const colaboradorServico = new Schema<ColaboradorServico>({
  colaboradorId: {
    type: Types.ObjectId,
    ref: "Colaborador",
    required: true,
  },
  servicoId: {
    type: Types.ObjectId,
    ref: "Servico",
    required: true,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    required: true,
    default: "A",
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model("ColaboradorServico", colaboradorServico);
