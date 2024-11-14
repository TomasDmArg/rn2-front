import React, { useState, useCallback, useMemo } from 'react';
import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewIcon, ViewOffSlashIcon } from "hugeicons-react";
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword, PasswordRequirements } from '../utils/auth';

/**
 * Register component for user registration
 */
const Register: React.FC = () => {
  const router = useIonRouter();
  const { register, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  /**
   * Memoized password requirements check
   */
  const passwordRequirements = useMemo(() => validatePassword(password), [password]);

  /**
   * Check if all password requirements are met
   */
  const allRequirementsMet = useMemo(() => 
    Object.values(passwordRequirements).every(req => req),
  [passwordRequirements]);

  /**
   * Validate form fields
   */
  const validateForm = useCallback(() => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!validateEmail(email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (!allRequirementsMet) {
      newErrors.password = "La contraseña no cumple con todos los requisitos";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, allRequirementsMet]);

  /**
   * Handle register form submission
   */
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const registerSuccess = await register(email, password);
        if (registerSuccess) {
          const loginSuccess = await login(email, password);
          if (loginSuccess) {
            router.push("/home");
          } else {
            setErrors({ email: "Error al iniciar sesión automáticamente" });
          }
        } else {
          setErrors({ email: "Error al registrar. El correo electrónico podría estar en uso." });
        }
      } catch (error) {
        setErrors({ email: "Ocurrió un error durante el registro" });
      }
    }
  }, [email, password, validateForm, register, login, router]);

  /**
   * Render a single password requirement item
   */
  const RequirementItem = ({ text, met }: { text: string; met: boolean }) => (
    <motion.li
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`text-sm ${met ? 'text-green-500' : 'text-gray-500'}`}
    >
      {text}
    </motion.li>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className='w-full h-full flex flex-col items-center justify-center max-w-[500px] px-12 mx-auto gap-6'>
          <h1 className='flex flex-row items-center gap-3 font-bold text-3xl mb-4'>
            <img src="/waving-hand-sign_1f44b.png" className="w-[30px] h-[30px]" alt="Saludo" />
            Regístrate
          </h1>
          <form onSubmit={handleRegister} className='flex flex-col gap-3 w-full'>
            <div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={errors.password ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <ViewIcon /> : <ViewOffSlashIcon />}
                </button>
              </div>
              {errors.password && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.password}</AlertDescription>
                </Alert>
              )}
            </div>
            <div>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <ViewIcon /> : <ViewOffSlashIcon />}
                </button>
              </div>
              {errors.confirmPassword && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{errors.confirmPassword}</AlertDescription>
                </Alert>
              )}
            </div>
            <AnimatePresence>
              {password.length > 0 && !allRequirementsMet && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <RequirementItem text="Al menos 8 caracteres de longitud" met={passwordRequirements.length} />
                  <RequirementItem text="Contiene una letra mayúscula" met={passwordRequirements.uppercase} />
                  <RequirementItem text="Contiene una letra minúscula" met={passwordRequirements.lowercase} />
                  <RequirementItem text="Contiene un número" met={passwordRequirements.number} />
                  <RequirementItem text="Contiene un carácter especial" met={passwordRequirements.special} />
                </motion.ul>
              )}
            </AnimatePresence>
            <Button type="submit" className="w-full mt-4">Registrarse</Button>
            <Button type="button" className="w-full" variant="outline" onClick={() => router.push('/login')}>
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          </form>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Register;