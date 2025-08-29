import { useEffect } from 'react';

export const useDisableScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      
      // Hacer el body con posición fija para prevenir el scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflowY = 'scroll';
      
      return () => {
        // Restaurar los estilos al cerrar el modal
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflowY = '';
        
        // Restaurar la posición del scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};

/* Solución más versátil para más navegadores si es necesario
import { useEffect } from 'react';

export const useDisableScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual
      const scrollY = window.scrollY;
      
      // Bloquear scroll pero mantener posición
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
};*/