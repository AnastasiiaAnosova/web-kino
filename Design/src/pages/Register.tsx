import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { DecorativeHeader } from '../components/layout/DecorativeHeader';
import { Footer } from '../components/layout/Footer';
import { DecorativeCurtain } from '../components/layout/DecorativeCurtain';
import { register, updateProfile, getCurrentUser, setCurrentUser } from '../api/auth';
import { getAllUsers, getUserById, deleteUserById } from '../api/get_users';
import { User } from '../types';

export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'other' as 'male' | 'female' | 'other',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin' | 'host'
  });
  
  const [currentUserData, setCurrentUserData] = useState({} as User);
  const [selectedUserToChange, setSelectedUserToChange] = useState({} as User);
  const [usersToChange, setUsersToChange] = useState([] as User[]);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setFormData({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
          gender: currentUser.gender,
          password: currentUser.password,
          confirmPassword: currentUser.password,
          role: currentUser.role,
        });
        
        setCurrentUserData(currentUser);

        setSelectedUserToChange(currentUser);

        setAvatarPreview(currentUser.avatar);

        //console.log("upravuje admin: " + isCurrentUserAdmin() + " " + currentUser.role);

        if(currentUser.role == "admin"){
          getUsersToChange();
        }
      }
    }
  }, [isEditMode]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatar(result);
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditMode && formData.password !== formData.confirmPassword) {
      alert('Hesla se neshodují!');
      return;
    }

    try {
      if (isEditMode) {
        await updateProfile({
          id: selectedUserToChange.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          avatar: avatar || avatarPreview,
          role: formData.role,
        } as Partial<User>);
        
        alert('Profil byl úspěšně aktualizován!');
      } else {
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          password: formData.password,
          avatar: avatar,
          role: 'user' as 'user' | 'admin' | 'host',
        });
        
        alert('Registrace úspěšná! Budete přesměrováni na hlavní stránku.');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      alert('Došlo k chybě. Zkuste to prosím znovu.');
    }
  };

  const deleteSelectedUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = window.confirm("Chcete opravdu odstranit uživatele " + selectedUserToChange.firstName + " " + selectedUserToChange.lastName + "?");
    if (!confirmed) return;
    
    await deleteUserById(selectedUserToChange.id);
    navigate('/');
  }

  const getUsersToChange = () => {

    // Provizorni vyber ze vsech uzivatel
    const func = async () => {
      setUsersToChange(await getAllUsers());
    }
    
    func();
  }

  const isCurrentUserAdmin = () => {
    return currentUserData.role == "admin";
  }

  const updateSelectedUserById = async (idStr: string) => {

    const id = parseInt(idStr, 10);
    if (Number.isNaN(id)) return;

    const user = await getUserById(id);

    setSelectedUserToChange(user);

    setFormData({
          firstName: user.firstName,
          lastName: user.lastName ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
          gender: user.gender ?? "other",
          password: user.password ?? "",
          confirmPassword: user.password ?? "",
          role: user.role, // Asi to nema cenu checkovat pro prazdnou roli
        });
  }

  return (
    <div className="min-h-screen bg-white font-display">
      <DecorativeHeader showBackButton={true} />

      <DecorativeCurtain position="top" />

      <main className="relative">
        <div className="container">
          {/* Title section */}
          <div className="relative text-center py-16 mb-16">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#912D3C]/10" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-[#912D3C]/5" />
            
            <div className="relative z-10">
              <h2 className="text-4xl tracking-widest mb-4">
                {isEditMode ? 'UPRAVIT PROFIL' : 'REGISTRACE'}
              </h2>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#912D3C]" />
                <svg className="w-6 h-6 text-[#912D3C]" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" />
                </svg>
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#912D3C]" />
              </div>
              
              <p className="max-w-2xl mx-auto text-gray-700">
                {isEditMode 
                  ? 'Upravte své údaje' 
                  : 'Vytvořte si účet pro rezervaci vstupenek a sledování historie'}
              </p>
            </div>
          </div>

          {/* Registration form */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-white shadow-2xl rounded-lg p-8 md:p-12 border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar upload */}
                
                <div className={isCurrentUserAdmin() ? "grid grid-cols-1 md:grid-cols-2 gap-6" : ""}>
                    {isCurrentUserAdmin() &&
                        <div className="">
                        <div className='w-full py-3'>
                        <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                            UŽIVATEL *
                        </label>
                        <select
                            value={selectedUserToChange.id}
                            onChange={(e) => updateSelectedUserById(e.target.value as any)}
                            required
                            className="bg-white w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                        >
                            <option value={currentUserData.id}>Já</option>
                              { usersToChange.map((user: User) => {
                                return <option 
                                        key={user.id} 
                                        value={user.id}>{user.firstName + " " + (user.lastName || user.id) + ((user.email) ? " (" + user.email + ")" : "")}
                                        </option>
                              })}
                        </select>
                        </div>
                        </div>
                    }

                    <div className="flex justify-center mb-8">
                        <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-[#912D3C] overflow-hidden bg-gray-100 shadow-lg">
                            {selectedUserToChange.avatar /*avatarPreview*/ ? (
                                <img 
                                src={selectedUserToChange.avatar}
                                alt="Avatar preview" 
                                className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Camera className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#912D3C] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#A43D4C] transition-colors border-2 border-white shadow-md">
                            <Camera className="w-5 h-5 text-white" />
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                      JMÉNO *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                      PŘÍJMENÍ *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                    POHLAVÍ *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif bg-white"
                  >
                    <option value="other">Jiné</option>
                    <option value="male">Muž</option>
                    <option value="female">Žena</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                    E-MAIL *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                  />
                </div>

                <div>
                  <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                    TELEFON *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+420"
                    className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                  />
                </div>

                <div>
                <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                    ROLE *
                </label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    required
                    disabled={!isCurrentUserAdmin()}
                    className={ ((isCurrentUserAdmin()) ? "bg-white " : "bg-gray-200 ") + "w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"}
                >
                    <option value="user">Uživatel</option>
                    <option value="admin">Admin</option>
                    <option value="host">Host</option>
                </select>
                </div>

                {!isEditMode && (
                  <>
                    <div>
                      <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                        HESLO *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-display tracking-wider text-gray-700 mb-2">
                        POTVRDIT HESLO *
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:border-[#912D3C] focus:ring-2 focus:ring-[#912D3C]/20 transition-all font-serif"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#912D3C] text-white font-display tracking-widest py-4 px-8 text-sm hover:bg-[#A43D4C] transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isEditMode ? 'ULOŽIT ZMĚNY' : 'VYTVOŘIT ÚČET'}
                </button>

                {(isCurrentUserAdmin() && isEditMode) && 
                    <button
                    onClick={(e) => deleteSelectedUser(e)}
                    className="w-full bg-[#912D3C] text-white font-display tracking-widest py-4 px-8 text-sm hover:bg-[#A43D4C] transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                    ODSTRANIT ÚČET
                    </button>
                }
                
                {!isEditMode && (
                  <div className="text-center mt-6">
                    <p className="text-gray-600 font-serif">
                      Již máte účet?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-[#912D3C] hover:text-[#A43D4C] font-semibold"
                      >
                        Přihlaste se
                      </button>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <DecorativeCurtain position="bottom" />
      </main>

      <Footer />
    </div>
  );
};