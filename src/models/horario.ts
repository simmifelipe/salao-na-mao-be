import { Schema, Types, model } from "mongoose";

export type Horario = {
  salaoId: string;
  especialidades: [string];
  colaboradores: [string];
  dias: [number];
  inicio: Date;
  fim: Date;
  dataCadastro: Date;
};

const horario = new Schema<Horario>({
  salaoId: {
    type: Types.ObjectId,
    ref: "Salao",
    required: true,
  },
  especialidades: [
    {
      type: Types.ObjectId,
      ref: "Servico",
      required: true,
    },
  ],
  colaboradores: [
    {
      type: Types.ObjectId,
      ref: "Colaborador",
      required: true,
    },
  ],
  dias: {
    type: [Number],
    required: true,
  },
  inicio: {
    type: Date,
    required: true,
  },
  fim: {
    type: Date,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model<Horario>("Horario", horario);
