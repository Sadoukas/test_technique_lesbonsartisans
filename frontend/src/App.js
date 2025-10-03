import React, { useState, useEffect, useMemo } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Slider,
  Collapse,
  Snackbar,
  Fade,
  Zoom,
  Pagination,
  Skeleton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  Euro as EuroIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { ProductService } from './services/ProductService';
import webSocketService from './services/WebSocketService';

// Thème Material UI personnalisé avec mode sombre/clair
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#4CAF50' : '#2E7D32',
      light: mode === 'dark' ? '#81C784' : '#4CAF50',
      dark: mode === 'dark' ? '#388E3C' : '#1B5E20',
    },
    secondary: {
      main: mode === 'dark' ? '#FF9800' : '#FF6F00',
      light: mode === 'dark' ? '#FFB74D' : '#FF9800',
      dark: mode === 'dark' ? '#F57C00' : '#E65100',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: mode === 'dark' 
              ? '0 8px 25px rgba(0,0,0,0.3)' 
              : '0 8px 25px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
  },
});

function App() {
  // États principaux
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // États pour les dialogues et formulaires
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'phone',
    price: '',
    rating: '',
    warranty_years: '',
    available: true
  });

  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // États pour les notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Thème dynamique
  const theme = useMemo(() => createAppTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  // Sauvegarder le mode sombre
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Charger les produits et configurer WebSocket
  useEffect(() => {
    loadProducts();
    
    // Configuration des écouteurs WebSocket
    webSocketService.onProductCreated((newProduct) => {
      console.log('🆕 Nouveau produit créé:', newProduct);
      setProducts(prevProducts => [...prevProducts, newProduct]);
      showSnackbar('Produit ajouté avec succès !', 'success');
    });

    webSocketService.onProductUpdated((updatedProduct) => {
      console.log('✏️ Produit mis à jour:', updatedProduct);
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
      showSnackbar('Produit modifié avec succès !', 'success');
    });

    webSocketService.onProductDeleted(({ id }) => {
      console.log('🗑️ Produit supprimé:', id);
      setProducts(prevProducts => 
        prevProducts.filter(product => product._id !== id)
      );
      showSnackbar('Produit supprimé avec succès !', 'success');
    });

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      showSnackbar('Erreur lors du chargement des produits', 'error');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions de gestion des produits
  const handleAddProduct = async () => {
    try {
      await ProductService.createProduct(formData);
      setOpenDialog(false);
      resetForm();
    } catch (err) {
      showSnackbar('Erreur lors de l\'ajout du produit', 'error');
      console.error('Erreur:', err);
    }
  };

  const handleEditProduct = async () => {
    try {
      await ProductService.updateProduct(editingProduct._id, formData);
      setOpenDialog(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      showSnackbar('Erreur lors de la modification du produit', 'error');
      console.error('Erreur:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await ProductService.deleteProduct(id);
      } catch (err) {
        showSnackbar('Erreur lors de la suppression du produit', 'error');
        console.error('Erreur:', err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'phone',
      price: '',
      rating: '',
      warranty_years: '',
      available: true
    });
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      price: product.price.toString(),
      rating: product.rating.toString(),
      warranty_years: product.warranty_years.toString(),
      available: product.available
    });
    setOpenDialog(true);
  };

  // Filtrage et tri des produits
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAvailability = filterAvailable === 'all' || 
        (filterAvailable === 'available' && product.available) ||
        (filterAvailable === 'unavailable' && !product.available);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;
      
      return matchesSearch && matchesAvailability && matchesPrice && matchesRating;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return a.rating - b.rating;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, filterAvailable, sortBy, priceRange, minRating]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAvailable('all');
    setSortBy('name');
    setPriceRange([0, 1000]);
    setMinRating(0);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterAvailable !== 'all' || 
    priceRange[0] > 0 || priceRange[1] < 1000 || minRating > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        {/* AppBar avec toggle thème */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <PhoneIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Les Bons Artisans
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  icon={<LightModeIcon />}
                  checkedIcon={<DarkModeIcon />}
                />
              }
              label={darkMode ? 'Sombre' : 'Clair'}
              sx={{ color: 'white' }}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Titre principal */}
          <Fade in timeout={800}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
              Nos Produits
            </Typography>
          </Fade>

          {/* Barre de recherche et filtres */}
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <IconButton
                onClick={() => setShowFilters(!showFilters)}
                color="primary"
                sx={{
                  transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease-in-out'
                }}
              >
                <FilterIcon />
              </IconButton>
              {hasActiveFilters && (
                <Button
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  variant="outlined"
                  size="small"
                  color="secondary"
                >
                  Effacer
                </Button>
              )}
            </Box>

            <Collapse in={showFilters}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Disponibilité</InputLabel>
                    <Select
                      value={filterAvailable}
                      onChange={(e) => setFilterAvailable(e.target.value)}
                      label="Disponibilité"
                    >
                      <MenuItem value="all">Tous</MenuItem>
                      <MenuItem value="available">Disponibles</MenuItem>
                      <MenuItem value="unavailable">Non disponibles</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Trier par</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Trier par"
                    >
                      <MenuItem value="name">Nom (A-Z)</MenuItem>
                      <MenuItem value="name-desc">Nom (Z-A)</MenuItem>
                      <MenuItem value="price">Prix (croissant)</MenuItem>
                      <MenuItem value="price-desc">Prix (décroissant)</MenuItem>
                      <MenuItem value="rating">Note (croissante)</MenuItem>
                      <MenuItem value="rating-desc">Note (décroissante)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography gutterBottom>
                      Prix: {priceRange[0]}€ - {priceRange[1]}€
                    </Typography>
                    <Slider
                      value={priceRange}
                      onChange={(e, newValue) => setPriceRange(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={1000}
                      step={10}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box>
                    <Typography gutterBottom>
                      Note minimale: {minRating} ⭐
                    </Typography>
                    <Slider
                      value={minRating}
                      onChange={(e, newValue) => setMinRating(newValue)}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5}
                      step={0.5}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Collapse>
          </Paper>

          {/* Messages d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading skeleton */}
          {loading && (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Header skeleton */}
                    <Box sx={{ p: 3, pb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                        <Skeleton variant="text" width="60%" height={28} />
                        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 2 }} />
                      </Box>
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 2 }} />
                    </Box>
                    
                    {/* Content skeleton */}
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ mb: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
                          <Box>
                            <Skeleton variant="text" width={30} height={16} />
                            <Skeleton variant="text" width={50} height={24} />
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
                          <Box>
                            <Skeleton variant="text" width={30} height={16} />
                            <Skeleton variant="text" width={40} height={20} />
                          </Box>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={2}>
                          <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
                          <Box>
                            <Skeleton variant="text" width={50} height={16} />
                            <Skeleton variant="text" width={35} height={20} />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    {/* Actions skeleton */}
                    <Box sx={{ p: 3, pt: 0, display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                      <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 2 }} />
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Grille des produits */}
          {!loading && (
            <Fade in timeout={1000}>
              <Grid container spacing={3}>
                {paginatedProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <Zoom in timeout={300 + index * 100}>
                      <Card 
                        elevation={2}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3,
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.palette.mode === 'dark' 
                              ? '0 12px 40px rgba(0,0,0,0.4)' 
                              : '0 12px 40px rgba(0,0,0,0.15)',
                          },
                        }}
                      >
                        {/* Header avec statut */}
                        <Box 
                          sx={{ 
                            p: 3, 
                            pb: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
                            borderBottom: `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                            <Typography 
                              variant="h6" 
                              component="h2" 
                              sx={{ 
                                fontWeight: 600,
                                lineHeight: 1.3,
                                color: theme.palette.text.primary
                              }}
                            >
                              {product.name}
                            </Typography>
                            <Chip
                              icon={product.available ? <CheckCircleIcon /> : <CancelIcon />}
                              label={product.available ? 'Disponible' : 'Indisponible'}
                              color={product.available ? 'success' : 'error'}
                              size="small"
                              sx={{ 
                                fontWeight: 500,
                                borderRadius: 2
                              }}
                            />
                          </Box>
                          
                          <Chip 
                            label={product.type} 
                            variant="outlined" 
                            size="medium"
                            sx={{ 
                              fontWeight: 500,
                              borderRadius: 2,
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main
                            }} 
                          />
                        </Box>

                        {/* Contenu principal */}
                        <CardContent sx={{ p: 3, flexGrow: 1 }}>
                          <Box sx={{ mb: 3 }}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <Box 
                                sx={{ 
                                  p: 1.5, 
                                  borderRadius: 2, 
                                  backgroundColor: theme.palette.primary.main + '20',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <EuroIcon color="primary" sx={{ fontSize: 20 }} />
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Prix
                                </Typography>
                                <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                                  {product.price}€
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <Box 
                                sx={{ 
                                  p: 1.5, 
                                  borderRadius: 2, 
                                  backgroundColor: theme.palette.secondary.main + '20',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <StarIcon color="secondary" sx={{ fontSize: 20 }} />
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Note
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                  {product.rating}/5 ⭐
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box 
                                sx={{ 
                                  p: 1.5, 
                                  borderRadius: 2, 
                                  backgroundColor: theme.palette.grey[500] + '20',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <SecurityIcon sx={{ fontSize: 20, color: theme.palette.grey[600] }} />
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  Garantie
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {product.warranty_years} an{product.warranty_years > 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                        
                        {/* Actions */}
                        <Box 
                          sx={{ 
                            p: 3, 
                            pt: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            width: '100%',
                            textAlign: 'center'
                          }}
                        >
                          <Tooltip title="Modifier le produit">
                            <Button
                              variant="outlined"
                              startIcon={<EditIcon />}
                              onClick={() => openEditDialog(product)}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 3,
                                py: 1,
                                minWidth: 120
                              }}
                            >
                              Modifier
                            </Button>
                          </Tooltip>
                          <Tooltip title="Supprimer le produit">
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteProduct(product._id)}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 3,
                                py: 1,
                                minWidth: 120
                              }}
                            >
                              Supprimer
                            </Button>
                          </Tooltip>
                        </Box>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          )}

          {/* Message si aucun produit */}
          {!loading && filteredAndSortedProducts.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucun produit trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Essayez de modifier vos critères de recherche
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {!loading && filteredAndSortedProducts.length > itemsPerPage && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(e, page) => setCurrentPage(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* Bouton d'ajout flottant */}
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => {
              resetForm();
              setEditingProduct(null);
              setOpenDialog(true);
            }}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
            }}
          >
            <AddIcon />
          </Fab>

          {/* Dialog d'ajout/modification */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nom du produit"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prix (€)"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Note (0-5)"
                      type="number"
                      inputProps={{ min: 0, max: 5, step: 0.1 }}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Garantie (années)"
                      type="number"
                      value={formData.warranty_years}
                      onChange={(e) => setFormData({ ...formData, warranty_years: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.available}
                          onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        />
                      }
                      label="Disponible"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
              <Button
                onClick={editingProduct ? handleEditProduct : handleAddProduct}
                variant="contained"
              >
                {editingProduct ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar pour les notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;