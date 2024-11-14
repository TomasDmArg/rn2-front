import { IonContent, IonPage, useIonRouter } from '@ionic/react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleIcon, ViewIcon, ViewOffSlashIcon } from "hugeicons-react";
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/auth';

/** 
 * Login component for user authentication
 */
const Login: React.FC = () => {
    const router = useIonRouter();
    const { login, loginWithGoogle, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

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
        const newErrors: { email?: string; password?: string } = {};

        if (!validateEmail(email)) {
            newErrors.email = "El correo electrónico no es válido";
        }

        if (!password) {
            newErrors.password = "La contraseña es requerida";
        } else if (!allRequirementsMet) {
            newErrors.password = "La contraseña no cumple con todos los requisitos";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [email, password, allRequirementsMet]);

    /** 
     * Handle login form submission
     */
    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);

        if (!validateForm()) return;

        try {
            const passed = await login(email, password);
            if (!passed) {
                setErrors({ password: "Credenciales inválidas" });
            } else {
                router.push("/home");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrors({ general: "Ocurrió un error durante el inicio de sesión. Por favor, inténtelo de nuevo." });
        }
    }, [email, password, validateForm, login, router]);

    /** Handle Register redirect */
    const handleRegister = () => {
        router.push("/register", "forward", "push");
    }

    /** 
     * Redirect to home if already authenticated
     */
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/home", "forward", "push");
        }
    }, [isAuthenticated, router]);





    // Add new handler for Google login
    const handleGoogleLogin = async () => {
        try {
            const success = await loginWithGoogle();
            if (success) {
                router.push("/home");
            } else {
                setErrors({ general: "Error al iniciar sesión con Google" });
            }
        } catch (error) {
            console.error("Google login error:", error);
            setErrors({ general: "Ocurrió un error durante el inicio de sesión con Google" });
        }
    };

    /** 
     * Render a single password requirement item
     */
    const RequirementItem = ({ text, met }: { text: string; met: boolean }) => (
        <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`text-sm ${isSubmitted ? (met ? 'text-green-500' : 'text-red-500') : (met ? 'text-green-500' : 'text-gray-500')}`}
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
                        Bienvenido!
                    </h1>
                    <form onSubmit={handleLogin} className='flex flex-col gap-3 w-full'>
                        {errors.general && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{errors.general}</AlertDescription>
                            </Alert>
                        )}
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
                        <Button type="submit" className="rounded-xl mt-4">
                            Iniciar sesión
                        </Button>

                        <Button type="button" className="rounded-xl" variant="outline" onClick={handleRegister}>
                            Registrarse
                        </Button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    O continuar con
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl flex items-center gap-2"
                            onClick={handleGoogleLogin}
                        >
                            <GoogleIcon className="h-5 w-5" />
                            Continuar con Google
                        </Button>
                    </form>
                </main>
            </IonContent>
        </IonPage>
    );
};

export default Login;