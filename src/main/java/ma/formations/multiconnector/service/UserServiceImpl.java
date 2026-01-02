package ma.formations.multiconnector.service;

import lombok.AllArgsConstructor;
import ma.formations.multiconnector.dao.PermissionRepository;
import ma.formations.multiconnector.dao.RoleRepository;
import ma.formations.multiconnector.dao.UserRepository;
import ma.formations.multiconnector.dtos.user.PermissionVo;
import ma.formations.multiconnector.dtos.user.RoleVo;
import ma.formations.multiconnector.dtos.user.UserVo;
import ma.formations.multiconnector.service.model.Permission;
import ma.formations.multiconnector.service.model.Role;
import ma.formations.multiconnector.service.model.User;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements IUserService, UserDetailsService {
    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;
    private ModelMapper modelMapper;
    private PermissionRepository permissionRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));
        UserVo userVo = modelMapper.map(user, UserVo.class);
        
        // Conserver les rôles originaux et ajouter les permissions comme autorités
        List<RoleVo> allAuthorities = new ArrayList<>(userVo.getRoles());
        
        // Ajouter les permissions de chaque rôle comme autorités individuelles
        userVo.getRoles().forEach(
                roleVo -> roleVo.getAuthorities().forEach(
                        permission -> allAuthorities.add(
                                RoleVo.builder().authority(permission.getAuthority()).build())));
        
        userVo.setRoles(allAuthorities);
        return userVo;
    }

    @Override
    public void save(UserVo userVo) {
        User user = modelMapper.map(userVo, User.class);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Associer les rôles existants
        user.setAuthorities(
                userVo.getRoles().stream()
                        .map(roleVo -> roleRepository.findByAuthority(roleVo.getAuthority())
                                .orElseThrow(() -> new RuntimeException("Role not found: " + roleVo.getAuthority())))
                        .collect(Collectors.toList())
        );

        userRepository.save(user);
    }

    @Override
    public void save(RoleVo roleVo) {
        Role role = modelMapper.map(roleVo, Role.class);
        role.setAuthorities(roleVo.getAuthorities().stream().map(bo ->
                permissionRepository.findByAuthority(bo.getAuthority()).get()).
                collect(Collectors.toList()));
        roleRepository.save(role);
    }

    @Override
    public void save(PermissionVo vo) {
        permissionRepository.save(modelMapper.map(vo, Permission.class));
    }

    @Override
    public RoleVo getRoleByName(String authority) {
        Role role = roleRepository.findByAuthority(authority)
                .orElseThrow(() -> new RuntimeException("Role not found: " + authority));
        return modelMapper.map(role, RoleVo.class);
    }

    @Override
    public PermissionVo getPermissionByName(String authority) {
        Permission permission = permissionRepository.findByAuthority(authority)
                .orElseThrow(() -> new RuntimeException("Permission not found: " + authority));
        return modelMapper.map(permission, PermissionVo.class);
    }
}