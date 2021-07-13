import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import busboy from "connect-busboy";
import busboyBodyParser from "busboy-body-parser";

import salaoRoutes from "./routes/salao.routes";
import servicoRoutes from "./routes/servico.routes";
import horarioRoutes from "./routes/horario.routes";
import colaboradorRoutes from "./routes/colaborador.routes";
import clienteRoutes from "./routes/cliente.routes";
import agendamentoRoutes from "./routes/agendamento.routes";

dotenv.config();

const app = express();
import "./database";

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(busboy());
app.use(busboyBodyParser());
app.use(cors());

// Rotas
app.use("/salao", salaoRoutes);
app.use("/servico", servicoRoutes);
app.use("/horario", horarioRoutes);
app.use("/colaborador", colaboradorRoutes);
app.use("/cliente", clienteRoutes);
app.use("/agendamento", agendamentoRoutes);

app.set("port", process.env.PORT || 8888);
app.listen(app.get("port"), () => {
  console.log(`Servidor rodando na porta ${app.get("port")}`);
});
