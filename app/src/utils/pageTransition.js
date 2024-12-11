import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 1.02,
  },
  in: {
    opacity: 1,
    scale: 1,
  },
  out: {
    opacity: 0,
    scale: 1.02,
  },
};

const backgroundVariants = {
  initial: {
    background: 'linear-gradient(45deg, rgba(83, 58, 194, 1), rgba(163, 62, 109, 1))',
  },
  in: {
    background: 'linear-gradient(45deg, rgba(43, 193, 85, 1), rgba(255, 137, 80, 1))',
  },
  out: {
    background: 'linear-gradient(45deg, rgba(163, 62, 109, 1), rgba(83, 58, 194, 1))',
  },
};

const transition = {
  duration: 0.2,
  ease: [0.43, 0.13, 0.23, 0.96],
};

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={transition}
      style={{
        position: 'relative', // Позиционирует контент в пределах контейнера
        overflowY: 'auto',  // Разрешаем вертикальную прокрутку
        overflowX: 'hidden', // Запрещаем горизонтальную прокрутку
        width: '100vw',       // Полная ширина окна
        minHeight: '100vh',      // Полная высота окна
      }}
    >
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={backgroundVariants}
        transition={transition}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',    // 100% ширины окна
          height: '100vh',
          zIndex: -1,
        }}
      />
      {children}
    </motion.div>
  );
};
