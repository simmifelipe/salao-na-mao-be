import { Schema, model, Types } from "mongoose";

type SalaoColaborador = {
  salaoId: string;
  colaboradorId: string;
  status: string;
  dataCadastro: Date;
}

const salaoColaborador = new Schema<SalaoColaborador>({
  salaoId: {
    type: Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  colaboradorId: {
    type: Types.ObjectId,
    ref: "Colaborador",
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

export default model("SalaoColaborador", salaoColaborador);
