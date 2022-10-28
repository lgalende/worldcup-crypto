import { Fragment, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
 
const theme = {
    accordion: {
      styles: {
        base: {
          container: {
            bgColor: "bg-white",
          },
        },
      },
    },
  };

function Icon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${
        id === open ? "rotate-180" : ""
      } h-5 w-5 transition-transform`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
 
const RoundsAccordion = () => {
  const [open, setOpen] = useState(0);
 
  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };
 
  return (
    <div className="p-5 m-1 w-full flex flex-col justify-start items-center blue-glassmorphism">
        <Fragment value={theme}>
        <Accordion open={open === 1} icon={<Icon id={1} open={open} />} value={theme}>
            <AccordionHeader onClick={() => handleOpen(1)}>
                <h1 className="mt-2 mb-3 text-white text-xl py-3">Matchday 1</h1>
            </AccordionHeader>
            <AccordionBody>
                <p className="text-white">
                    QATAR VS ECUADOR <br />
                    NEDERLANDS VS SENEGAL <br />
                    QATAR VS ECUADOR <br />
                    NEDERLANDS VS SENEGAL <br />
                </p>
            </AccordionBody>
        </Accordion>
        <div className="h-[1px] w-full bg-gray-400 my-2" />
        <Accordion open={open === 2} icon={<Icon id={2} open={open} />}>
            <AccordionHeader onClick={() => handleOpen(2)}>
                <h1 className="mt-2 mb-3 text-white text-xl py-3">Matchday 2</h1>
            </AccordionHeader>
            <AccordionBody>
            We're not always in the position that we want to be at. We're
            constantly growing. We're constantly making mistakes. We're constantly
            trying to express ourselves and actualize our dreams.
            </AccordionBody>
        </Accordion>
        <div className="h-[1px] w-full bg-gray-400 my-2" />
        <Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
            <AccordionHeader onClick={() => handleOpen(3)}>
                <h1 className="mt-2 mb-3 text-white text-xl py-3">Matchday 3</h1>
            </AccordionHeader>
            <AccordionBody>
            We're not always in the position that we want to be at. We're
            constantly growing. We're constantly making mistakes. We're constantly
            trying to express ourselves and actualize our dreams.
            </AccordionBody>
        </Accordion>
        <div className="h-[1px] w-full bg-gray-400 my-2" />
        <Accordion open={open === 4} icon={<Icon id={4} open={open} />} >
            <AccordionHeader onClick={() => handleOpen(4)}>
                <h1 className="mt-2 mb-3 text-white text-xl py-3">Round of 16</h1>
            </AccordionHeader>
            <AccordionBody>
            Come back in a few days...
            </AccordionBody>
        </Accordion>
        </Fragment>
    </div>
  );
}

export default RoundsAccordion;