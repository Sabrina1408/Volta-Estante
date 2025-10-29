import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../hooks/useApi";
import styles from "./Perfil.module.css";
import ProfileCard from "../../components/ProfileCard/ProfileCard";
import ManageEmployees from "../../components/ManageEmployees/ManageEmployees";

const Perfil = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { authFetch } = useApi();
  const queryClient = useQueryClient();

  // Mutação para atualizar os dados do perfil
  const { mutate: updateUser, isLoading: isSaving } = useMutation({
    mutationFn: (updatedData) =>
      authFetch(`/users/${user.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }),
    onSuccess: () => {
      alert("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["userProfile", user?.uid] });
    },
    onError: (error) => alert(`Erro ao atualizar perfil: ${error.message}`),
  });

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile", user?.uid], // Chave única para o cache
    queryFn: async () => {
      const res = await authFetch(`/users/${user.uid}`);
      if (!res.ok) {
        throw new Error("Não foi possível carregar os dados do perfil.");
      }
      return res.json();
    },
    enabled: !!user, // Só executa a query se o 'user' existir
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
    // A API espera 'nameSebo' e 'name', que são os campos editáveis no card.
    updateUser(updatedData);
  };

  const handleCancel = () => {
    // Ao cancelar, podemos navegar de volta para a página inicial, por exemplo.
    navigate("/dashboard");
  };

  if (isLoading) {
    return <div className={styles.perfil}>Carregando perfil...</div>;
  }

  if (error) {
    // O objeto de erro do React Query já tem a mensagem
    return (
      <div className={styles.perfil}>
        <p className="error">Erro ao carregar o perfil: {error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.perfil}>
      {/* O ProfileCard agora gerencia a exibição e edição dos dados */}
      <ProfileCard
        user={profileData}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />

      {/* Seção para gerenciar funcionários, visível apenas para admins */}
      {profileData?.userRole === "Admin" && (
        <div className={styles.manageSection}>
          <ManageEmployees />
        </div>
      )}

      {/* O botão de logout pode ficar fora do card, como uma ação global da página */}
      <button className={styles.logoutButton} onClick={handleLogout}>
        Sair da Conta
      </button>
    </div>
  );
};

export default Perfil;
