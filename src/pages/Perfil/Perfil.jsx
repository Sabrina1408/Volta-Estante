import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import styles from "./Perfil.module.css";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import ManageEmployees from "../../components/ManageEmployees/ManageEmployees";
import AlertModal from '../../components/AlertModal/AlertModal';
import { getFriendlyError } from "../../utils/errorMessages";

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  const { mutate: updateUser, isLoading: isSaving } = useMutation({
    mutationFn: (updatedData) =>
      authFetch(`/users/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }),
    onSuccess: () => {
      setAlertMessage('Perfil atualizado com sucesso!');
      setAlertOpen(true);
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.uid] });
    },
    onError: (error) => {
  setAlertMessage(getFriendlyError('PROFILE_UPDATE_FAILED'));
      setAlertOpen(true);
    },
  });

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async () => {
      const res = await authFetch(`/users/${user.uid}`);
      if (!res.ok) {
        throw new Error("Não foi possível carregar os dados do perfil.");
      }
      return res.json();
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("logout error:", err);
    }
  };

  const handleSave = (updatedData) => {

    updateUser(updatedData);
  };

  const handleCancel = () => {
    navigate("/perfil");
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  if (isLoading) {
    return <div className={styles.perfil}>Carregando perfil...</div>;
  }

  if (error) {

    return (
      <div className={styles.perfil}>
        <p className="error">{getFriendlyError('PROFILE_LOAD_FAILED')}</p>
      </div>
    );
  }

  return (
    <div className={styles.perfil}>
      <ProfileCard
        user={profileData}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
        onLogout={handleLogout}
      />
      {profileData?.userRole === "Admin" && (
        <div className={styles.manageSection}>
          <ManageEmployees />
        </div>
      )}

      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} title="Aviso" message={alertMessage} />
    </div>
  );
};

export default Perfil;