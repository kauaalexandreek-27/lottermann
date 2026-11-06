/* ============================================================
   SERVICES.JS
   Serviços e valores da Lottermann Barbearia.
   Para alterar um preço ou descrição, edite apenas este arquivo.
   - id: identificador único (usado internamente, não alterar depois de criado)
   - name: nome exibido
   - desc: descrição curta exibida no card
   - price: valor em reais (número, use ponto para centavos)
   - icon: nome do ícone (usado em getServiceIcon() no main.js)
   ============================================================ */

const SERVICES = [
  {
    id: "corte-cabelo",
    name: "Corte de cabelo",
    desc: "Corte personalizado com acabamento na navalha.",
    price: 40.0,
    icon: "scissors"
  },
  {
    id: "barba",
    name: "Barba",
    desc: "Modelagem completa com toalha quente e navalha.",
    price: 25.0,
    icon: "razor"
  },
  {
    id: "corte-barba",
    name: "Corte + Barba",
    desc: "O combo completo: cabelo e barba no mesmo horário.",
    price: 60.0,
    icon: "combo"
  },
  {
    id: "luzes",
    name: "Luzes",
    desc: "Iluminação de mechas para um visual moderno.",
    price: 100.0,
    icon: "spark"
  },
  {
    id: "limpeza-nasal",
    name: "Limpeza nasal",
    desc: "Remoção rápida e higiênica dos pelos nasais.",
    price: 15.0,
    icon: "clean"
  },
  {
    id: "degrade",
    name: "Degradê",
    desc: "Transição perfeita de comprimento, do zero ao topo.",
    price: 40.0,
    icon: "fade"
  },
  {
    id: "corte-social",
    name: "Corte social",
    desc: "Clássico e discreto, ideal para o ambiente de trabalho.",
    price: 35.0,
    icon: "comb"
  },
  {
    id: "platinado",
    name: "Platinado",
    desc: "Descoloração completa para um estilo marcante.",
    price: 150.0,
    icon: "bolt"
  }
];

/* Formata um número para o padrão de moeda brasileiro, ex: 40 -> "40,00" */
function formatPrice(value) {
  return value.toFixed(2).replace(".", ",");
}