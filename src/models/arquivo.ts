import { Schema, Types, model } from "mongoose";

export type Arquivo = {
  referenciaId: string;
  model: string;
  caminho: string;
  dataCadastro: Date;
};

const arquivo = new Schema<Arquivo>({
  referenciaId: {
    type: Schema.Types.ObjectId,
    refPath: "model",
  },
  model: {
    type: String,
    required: true,
    enum: ["Servico", "Salao"],
  },
  caminho: {
    type: String,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model<Arquivo>("Arquivo", arquivo);
