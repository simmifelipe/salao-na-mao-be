import { Schema, model } from "mongoose";
import { Endereco } from "./cliente";

export type Salao = {
  nome: string;
  foto: string;
  capa: string;
  email: string;
  senha: string;
  telefone: string;
  endereco: Endereco;
  geo: {
    tipo: string;
    coordinates: [number];
  };
  recipientId: string;
  dataCadastro: Date;
};

const salao = new Schema<Salao>({
  nome: {
    type: String,
    required: [true, "Nome é obrigatório"],
  },
  foto: String,
  capa: String,
  email: {
    type: String,
    required: [true, "E-mail é obrigatório"],
  },
  senha: {
    type: String,
    default: null,
  },
  telefone: String,
  endereco: {
    cidade: String,
    uf: String,
    cep: String,
    numero: String,
    logradouro: String,
    pais: String,
  },
  geo: {
    tipo: String,
    coordinates: [Number],
  },
  recipientId: {
    type: String,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

salao.index({ geo: "2dsphere" });

export default model<Salao>("Salao", salao);
