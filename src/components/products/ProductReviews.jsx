import { useState, useEffect } from 'react';
import { reviewService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Star, Edit2, Trash2, Loader2, MessageSquare } from 'lucide-react';

export default function ProductReviews({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        product: parseInt(productId),
        rating: parseInt(formData.rating),
        comment: formData.comment
      };

      if (editingReview) {
        await reviewService.updateReview(editingReview.id, data);
        alert('✅ Reseña actualizada');
      } else {
        await reviewService.createReview(data);
        alert('✅ Reseña creada');
      }

      setShowForm(false);
      setEditingReview(null);
      setFormData({ rating: 5, comment: '' });
      loadReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      alert('❌ Error al guardar reseña');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Eliminar esta reseña?')) return;
    try {
      await reviewService.deleteReview(reviewId);
      alert('✅ Reseña eliminada');
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('❌ Error al eliminar reseña');
    }
  };

  const openEditForm = (review) => {
    setEditingReview(review);
    setFormData({ rating: review.rating, comment: review.comment });
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingReview(null);
    setFormData({ rating: 5, comment: '' });
    setShowForm(true);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Reseñas y Calificaciones
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex">{renderStars(Math.round(avgRating))}</div>
              <span className="text-lg font-semibold">{avgRating}</span>
              <span className="text-gray-600">({reviews.length} reseñas)</span>
            </div>
          )}
        </div>
        {isAuthenticated && !showForm && (
          <button
            onClick={openCreateForm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Escribir Reseña
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="mb-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingReview ? 'Editar Reseña' : 'Nueva Reseña'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Calificación</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comentario</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value})}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Escribe tu opinión sobre este producto..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingReview ? 'Actualizar' : 'Publicar'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                }}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Aún no hay reseñas para este producto</p>
          {isAuthenticated && (
            <button
              onClick={openCreateForm}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sé el primero en opinar
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-semibold">{review.rating}/5</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Por Usuario #{review.user} • {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {user && user.id === review.user && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditForm(review)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
