'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Book1,
  DocumentDownload,
  DocumentText,
  Link1,
  TickCircle,
} from 'iconsax-react';

const EASE = [0.16, 1, 0.3, 1] as const;

export function Panel1Visual() {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: EASE,
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE },
    },
  };

  if (reduce) {
    return (
      <div className="source-panel">
        <div className="source-panel__header">
          <span className="source-panel__title">Sumber Materi</span>
          <span className="source-panel__add">+ Tambah</span>
        </div>
        <div className="source-panel__grid">
          <div className="source-card">
            <DocumentDownload size={24} variant="Linear" className="source-card__icon" />
            <span className="source-card__label">Unggah PDF</span>
          </div>
          <div className="source-card source-card--active">
            <Book1 size={24} variant="Linear" className="source-card__icon" />
            <div className="source-card__details">
              <span className="source-card__label">Buku Siswa B. Indo Kls 5</span>
              <span className="source-card__sub">Kementerian Pendidikan</span>
            </div>
            <span className="source-card__dot" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="source-panel"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div className="source-panel__header" variants={itemVariants}>
        <span className="source-panel__title">Sumber Materi</span>
        <motion.span
          className="source-panel__add"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Tambah
        </motion.span>
      </motion.div>
      <div className="source-panel__grid">
        <motion.div
          className="source-card"
          variants={itemVariants}
          whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(23,23,23,0.06)' }}
        >
          <div className="source-card__icon-wrapper source-card__icon-wrapper--pdf">
            <DocumentDownload size={22} variant="Linear" />
          </div>
          <span className="source-card__label">Unggah PDF</span>
        </motion.div>
        <motion.div
          className="source-card source-card--active"
          variants={itemVariants}
          whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(23,23,23,0.06)' }}
        >
          <div className="source-card__icon-wrapper source-card__icon-wrapper--book">
            <Book1 size={22} variant="Linear" />
          </div>
          <div className="source-card__details">
            <span className="source-card__label">Buku Siswa B. Indo Kls 5</span>
            <span className="source-card__sub">Kementerian Pendidikan</span>
          </div>
          <span className="source-card__dot" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Panel2Visual() {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: EASE,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE },
    },
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { delay: 0.6, type: 'spring', stiffness: 200, damping: 12 },
    },
  };

  const answerActiveVariants = {
    hidden: { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-line)' },
    visible: {
      backgroundColor: 'var(--color-success-soft)',
      borderColor: 'var(--color-success)',
      transition: { delay: 0.4, duration: 0.4 },
    },
  };

  if (reduce) {
    return (
      <div className="review-panel-mock">
        <div className="review-panel-mock__header">
          <div className="review-panel-mock__dots">
            <span className="dot dot--red" />
            <span className="dot dot--yellow" />
            <span className="dot dot--green" />
          </div>
          <span className="review-panel-mock__title">Tinjauan Draft</span>
        </div>
        <div className="review-panel-mock__content">
          <div className="review-card">
            <div className="review-card__header">
              <span className="review-card__tag">02 · Pilihan Ganda</span>
            </div>
            <p className="review-card__question">
              Apa gagasan utama dari teks bacaan pada Halaman 45?
            </p>
            <div className="review-card__options">
              <div className="review-option review-option--active">
                <TickCircle size={16} variant="Bold" className="review-option__check" />
                <span>1. Pahlawan nasional berjuang tanpa pamrih. (kunci)</span>
              </div>
              <div className="review-option">
                <span className="review-option__bullet" />
                <span>2. Sejarah kemerdekaan sangat panjang.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="review-panel-mock"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="review-panel-mock__header">
        <div className="review-panel-mock__dots">
          <span className="dot dot--red" />
          <span className="dot dot--yellow" />
          <span className="dot dot--green" />
        </div>
        <span className="review-panel-mock__title">Tinjauan Draft</span>
      </div>
      <div className="review-panel-mock__content">
        <motion.div className="review-card" variants={itemVariants}>
          <div className="review-card__header">
            <span className="review-card__tag">02 · Pilihan Ganda</span>
          </div>
          <p className="review-card__question">
            Apa gagasan utama dari teks bacaan pada Halaman 45?
          </p>
          <div className="review-card__options">
            <motion.div
              className="review-option review-option--active"
              variants={answerActiveVariants}
            >
              <motion.div variants={checkmarkVariants}>
                <TickCircle size={16} variant="Bold" className="review-option__check" />
              </motion.div>
              <span>1. Pahlawan nasional berjuang tanpa pamrih. <span className="key-badge">(kunci)</span></span>
            </motion.div>
            <motion.div className="review-option" variants={itemVariants}>
              <span className="review-option__bullet" />
              <span>2. Sejarah kemerdekaan sangat panjang.</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Panel3Visual() {
  const reduce = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
  };

  if (reduce) {
    return (
      <div className="export-panel-mock">
        <div className="export-panel-mock__card">
          <DocumentText size={28} variant="Linear" className="export-panel-mock__icon" />
          <span className="export-panel-mock__label">Cetak</span>
        </div>
        <div className="export-panel-mock__card">
          <DocumentDownload size={28} variant="Linear" className="export-panel-mock__icon" />
          <span className="export-panel-mock__label">PDF</span>
        </div>
        <div className="export-panel-mock__card">
          <Link1 size={28} variant="Linear" className="export-panel-mock__icon" />
          <span className="export-panel-mock__label">Tautan</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="export-panel-mock"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        className="export-panel-mock__card"
        variants={itemVariants}
        whileHover={{ scale: 1.05, y: -6, boxShadow: '0 12px 28px rgba(23,23,23,0.06)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="export-panel-mock__icon-wrapper export-panel-mock__icon-wrapper--print">
          <DocumentText size={28} variant="Linear" />
        </div>
        <span className="export-panel-mock__label">Cetak</span>
      </motion.div>
      <motion.div
        className="export-panel-mock__card"
        variants={itemVariants}
        whileHover={{ scale: 1.05, y: -6, boxShadow: '0 12px 28px rgba(23,23,23,0.06)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="export-panel-mock__icon-wrapper export-panel-mock__icon-wrapper--download">
          <DocumentDownload size={28} variant="Linear" />
        </div>
        <span className="export-panel-mock__label">PDF</span>
      </motion.div>
      <motion.div
        className="export-panel-mock__card"
        variants={itemVariants}
        whileHover={{ scale: 1.05, y: -6, boxShadow: '0 12px 28px rgba(23,23,23,0.06)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="export-panel-mock__icon-wrapper export-panel-mock__icon-wrapper--link">
          <Link1 size={28} variant="Linear" />
        </div>
        <span className="export-panel-mock__label">Tautan</span>
      </motion.div>
    </motion.div>
  );
}
