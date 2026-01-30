"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

const faqs = [
  {
    question: "Quels formats de schemas sont supportes ?",
    answer:
      "ElecFlow peut lire les schemas electriques exportes en PDF depuis la plupart des logiciels de conception. Les composants (disjoncteurs, differentiels, circuits) sont automatiquement detectes et extraits.",
  },
  {
    question: "Quels types de composants sont reconnus ?",
    answer:
      "ElecFlow reconnaît les disjoncteurs de branchement, les interrupteurs differentiels, les disjoncteurs divisionnaires, et les circuits finaux (eclairage, prises, chauffage, etc.). Les caracteristiques comme l'intensite nominale et la sensibilite sont automatiquement extraites.",
  },
  {
    question: "Comment fonctionne la simulation ?",
    answer:
      "La simulation modelise le flux de courant a travers le circuit. Vous pouvez basculer l'etat de chaque protection (ouvert/ferme) et voir instantanement quels recepteurs sont alimentes. En cas de coupure, ElecFlow identifie precisement quel organe bloque l'alimentation.",
  },
  {
    question: "ElecFlow verifie-t-il la conformite NF C 15-100 ?",
    answer:
      "ElecFlow verifie la logique du circuit et identifie les erreurs de conception. La verification complete de conformite NF C 15-100 (sections de cables, protections, etc.) est prevue dans une future version.",
  },
  {
    question: "Puis-je gerer plusieurs versions d'un meme schema ?",
    answer:
      "Oui, ElecFlow detecte automatiquement les schemas similaires grace a une empreinte structurelle. Lors de l'import d'une nouvelle version, vous pouvez choisir de la lier a un schema existant pour conserver l'historique des modifications.",
  },
  {
    question: "L'application est-elle disponible hors ligne ?",
    answer:
      "ElecFlow est une application web qui necessite une connexion internet. Cependant, une fois le schema charge, la simulation fonctionne entierement cote navigateur sans requerir de connexion permanente.",
  },
  {
    question: "Comment sont securisees mes donnees ?",
    answer:
      "Vos schemas sont stockes de maniere securisee et associes a votre organisation. Seuls les membres de votre organisation peuvent y acceder. Nous n'utilisons jamais vos donnees a des fins commerciales.",
  },
];

export function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Questions frequentes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tout ce que vous devez savoir sur ElecFlow
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
