import React, { useState, useEffect, useCallback, useContext } from 'react';
import { X, Star, Send, MessageSquare, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewService } from '../../services/reviewService';
import { AuthContext } from '../../context/AuthContext';

// ─── Star rating selector ────────────────────────────────────────────────────
function StarSelector({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1.5" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onClick={() => onChange(star)}
                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                    <Star
                        className={`w-7 h-7 transition-colors ${
                            star <= (hovered || value)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-white/10 fill-white/5'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

// ─── Individual review card ──────────────────────────────────────────────────
function ReviewCard({ review }) {
    const date = review.created_at
        ? new Date(review.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '—';

    return (
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 space-y-3 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-black text-textMain uppercase tracking-widest truncate">
                            {review.reviewer_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/10 fill-white/5'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <Calendar className="w-3 h-3 text-textMuted/40" />
                    <span className="text-[10px] font-bold text-textMuted/50 uppercase tracking-wider">{date}</span>
                </div>
            </div>
            <p className="text-sm text-textMuted leading-relaxed pl-12">{review.comment}</p>
        </div>
    );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────
export default function VehicleReviewPanel({ isOpen, onClose, vehicle }) {
    const { user } = useContext(AuthContext);

    const [reviews, setReviews]           = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showForm, setShowForm]         = useState(false);
    const [submitting, setSubmitting]     = useState(false);

    const [rating, setRating]             = useState(0);
    const [comment, setComment]           = useState('');
    const [reviewerName, setReviewerName] = useState('');

    // Pre-fill name from auth context if logged in
    useEffect(() => {
        if (user?.name) {
            setReviewerName(user.name);
        } else {
            setReviewerName('');
        }
    }, [user, isOpen]);

    // ── Fetch reviews for this vehicle ───────────────────────────────────────
    const fetchReviews = useCallback(async () => {
        if (!vehicle?.id) return;
        setLoadingReviews(true);
        try {
            const data = await reviewService.getByVehicleId(vehicle.id);
            setReviews(data || []);
        } catch (err) {
            console.error('Failed to load reviews:', err);
            toast.error('Could not load reviews');
        } finally {
            setLoadingReviews(false);
        }
    }, [vehicle?.id]);

    // Reset panel state each time it opens for a new vehicle
    useEffect(() => {
        if (isOpen && vehicle?.id) {
            fetchReviews();
            setShowForm(false);
            setRating(0);
            setComment('');
        }
    }, [isOpen, vehicle?.id, fetchReviews]);

    // ── Submit handler ───────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating) {
            toast.error('Please select a star rating');
            return;
        }
        if (!comment.trim()) {
            toast.error('Please write a comment before submitting');
            return;
        }
        if (!reviewerName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        setSubmitting(true);
        try {
            await reviewService.create({
                vehicle_id:    vehicle.id,
                user_id:       user?.id || null,
                reviewer_name: reviewerName.trim(),
                rating,
                comment,
            });
            toast.success('Review submitted successfully!');
            // Reset form
            setRating(0);
            setComment('');
            if (!user?.name) setReviewerName('');
            setShowForm(false);
            // Refresh list immediately without page reload
            await fetchReviews();
        } catch (err) {
            console.error('Review submit error:', err);
            toast.error(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setRating(0);
        setComment('');
    };

    if (!isOpen || !vehicle) return null;

    const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4"
            style={{ animation: 'fadeIn 0.2s ease' }}
        >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} aria-label="Close panel" />

            <div className="relative bg-[#0A0A0A] border border-white/5 rounded-t-[32px] sm:rounded-[32px] w-full sm:max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
                style={{ animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>

                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 pointer-events-none" />

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-white/5 shrink-0 gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.3em]">
                            Vehicle Reviews
                        </p>
                        <h3 className="font-black text-textMain text-lg italic uppercase tracking-tight truncate mt-0.5">
                            {vehicle.brand}&nbsp;<span className="text-primary">{vehicle.name}</span>
                        </h3>
                        {avgRating && (
                            <div className="flex items-center gap-2 mt-1.5">
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => (
                                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(parseFloat(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-white/10 fill-white/5'}`} />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-textMuted">{avgRating} avg · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-textMuted hover:text-textMain transition-all active:scale-90 border border-white/5 shrink-0"
                        aria-label="Close review panel"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Scrollable Body ─────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto overscroll-contain">

                    {/* ── Add Review Section ──────────────────────────────── */}
                    <div className="px-7 pt-6 pb-5 border-b border-white/5">
                        {!showForm ? (
                            /* Add Review Button — clean, full-width, no overlap */
                            <button
                                id="add-review-btn"
                                onClick={() => setShowForm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all font-black text-xs uppercase tracking-[0.2em]"
                            >
                                <Star className="w-4 h-4" />
                                Add Your Review
                            </button>
                        ) : (
                            /* Review Form */
                            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                {/* Form Header */}
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px] font-black text-textMuted uppercase tracking-[0.25em]">
                                        Write a Review
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleCancelForm}
                                        className="text-[10px] font-black text-textMuted/50 hover:text-textMuted uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Name field */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="reviewer-name"
                                        className="block text-[10px] font-black uppercase tracking-[0.3em] text-textMuted/60"
                                    >
                                        Your Name
                                    </label>
                                    <input
                                        id="reviewer-name"
                                        type="text"
                                        value={reviewerName}
                                        onChange={(e) => setReviewerName(e.target.value)}
                                        placeholder="Enter your name"
                                        maxLength={80}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-bold placeholder:text-textMuted/20"
                                    />
                                </div>

                                {/* Star Rating */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-textMuted/60">
                                        Rating
                                    </label>
                                    <StarSelector value={rating} onChange={setRating} />
                                    {rating > 0 && (
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">
                                            {ratingLabels[rating]}
                                        </p>
                                    )}
                                </div>

                                {/* Comment */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="review-comment"
                                        className="block text-[10px] font-black uppercase tracking-[0.3em] text-textMuted/60"
                                    >
                                        Comment
                                    </label>
                                    <textarea
                                        id="review-comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Share your experience with this vehicle..."
                                        rows={3}
                                        maxLength={600}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-medium resize-none placeholder:text-textMuted/20"
                                    />
                                    <p className="text-[10px] text-textMuted/30 text-right font-mono">
                                        {comment.length}/600
                                    </p>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary text-white hover:bg-blue-500 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-glow disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {submitting ? (
                                        <span className="animate-pulse">Submitting...</span>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Review
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* ── Reviews List ────────────────────────────────────── */}
                    <div className="px-7 py-6 space-y-4">
                        <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.3em]">
                            {loadingReviews
                                ? 'Loading reviews...'
                                : `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}`}
                        </p>

                        {loadingReviews ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 h-20 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                    <MessageSquare className="w-6 h-6 text-textMuted/30" />
                                </div>
                                <p className="text-[11px] font-black text-textMuted uppercase tracking-[0.2em]">
                                    No reviews yet
                                </p>
                                <p className="text-xs text-textMuted/40 font-medium">
                                    Be the first to review this vehicle
                                </p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Inline keyframes */}
            <style>{`
                @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
}
