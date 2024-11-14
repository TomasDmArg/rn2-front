import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAuth, User } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Alert, AlertDescription } from '../components/ui/alert';
import { MapPinIcon, CameraIcon, PhoneIcon, IdCardIcon } from 'lucide-react';

interface ProfileFormData {
  name: string;
  phone: string;
  address: string;
  documentId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    documentId: user?.documentId || '',
  });
  const [profileImage, setProfileImage] = useState<string | undefined>(user?.profilePicture);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Base64
      });

      setProfileImage(`data:image/jpeg;base64,${image.base64String}`);
    } catch (error) {
      console.error('Error taking picture:', error);
      setError('Error al tomar la foto');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      setFormData(prev => ({
        ...prev,
        location: {
          latitude: coordinates.coords.latitude,
          longitude: coordinates.coords.longitude
        }
      }));
      // Here you could use a geocoding service to get the address from coordinates
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Error al obtener la ubicación');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedData: Partial<User> = {
        ...formData,
        profilePicture: profileImage
      };
      await updateProfile(updatedData);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="w-full h-full max-w-[500px] mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                {profileImage ? (
                  <AvatarImage src={profileImage} alt="Profile" />
                ) : (
                  <AvatarFallback>{user?.name?.[0] || user?.email[0]}</AvatarFallback>
                )}
              </Avatar>
              <Button type="button" variant="outline" onClick={takePicture}>
                <CameraIcon className="mr-2 h-4 w-4" />
                Cambiar foto
              </Button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Input
                  name="name"
                  placeholder="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Input
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel"
                  inputPrefix={<PhoneIcon className="h-4 w-4" />}
                />
              </div>

              <div>
                <Input
                  name="address"
                  placeholder="Dirección"
                  value={formData.address}
                  onChange={handleInputChange}
                  inputPrefix={<MapPinIcon className="h-4 w-4" />}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mt-2"
                  onClick={getCurrentLocation}
                >
                  Usar ubicación actual
                </Button>
              </div>

              <div>
                <Input
                  name="documentId"
                  placeholder="Número de documento"
                  value={formData.documentId}
                  onChange={handleInputChange}
                  inputPrefix={<IdCardIcon className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert variant="default" className="bg-green-50 text-green-700">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Guardar cambios
            </Button>
          </form>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Profile; 