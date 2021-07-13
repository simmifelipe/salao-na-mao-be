import { Schema, Types, model } from "mongoose";

type SalaoCliente = {
  salaoId: string;
  clienteId: any;
  status: String;
  dataCadastro: Date;
};

const salaoCliente = new Schema<SalaoCliente>({
  salaoId: {
    type: Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  clienteId: {
    type: Types.ObjectId,
    ref: "Cliente",
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

export default model<SalaoCliente>("SalaoCliente", salaoCliente);
