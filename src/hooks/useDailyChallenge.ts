'use client';

import { useState, useEffect, useCallback } from 'react';
import { dailyChallengeService } from '@/lib/dailyChallenge';
import type { ServerStats } from '@/types/game';

export const useDailyChallenge = (isClient: boolean) => {
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [dailyChallengeResult, setDailyChallengeResult] = useState<{ won: boolean; attempts: number } | null>(null);
  const [canPlayDaily, setCanPlayDaily] = useState(true);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Vérifier le statut du défi quotidien
  const checkDailyChallengeStatus = useCallback(async () => {
    try {
      const canPlay = await dailyChallengeService.canPlayToday();
      setCanPlayDaily(canPlay);
      
      if (!canPlay) {
        // Si on ne peut pas jouer, obtenir le résultat du défi d'aujourd'hui
        const todayChallenge = await dailyChallengeService.getTodayChallenge();
        setDailyChallengeCompleted(true);
        setDailyChallengeResult({
          won: todayChallenge.won,
          attempts: todayChallenge.attempts
        });
      } else {
        setDailyChallengeCompleted(false);
        setDailyChallengeResult(null);
      }
    } catch (error) {
      console.error('Échec de récupération du statut du défi quotidien:', error);
      // Autoriser par défaut
      setCanPlayDaily(true);
      setDailyChallengeCompleted(false);
      setDailyChallengeResult(null);
    }
  }, []);

  // Obtenir les données statistiques
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const stats = await dailyChallengeService.getDailyStats();
      if (stats) {
        setServerStats(stats.server);
      } else {
        setServerStats(null);
      }
    } catch (error) {
      console.error("Échec de récupération des statistiques globales:", error);
      setServerStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Réinitialiser le statut du défi quotidien
  const resetDailyChallengeStatus = useCallback(() => {
    console.log('Compte à rebours terminé, réinitialisation du statut du défi quotidien');
    setDailyChallengeCompleted(false);
    setDailyChallengeResult(null);
    setCanPlayDaily(true);
  }, []);

  // Mettre à jour le statut de completion du défi quotidien
  const updateDailyChallengeResult = useCallback((won: boolean, attempts: number) => {
    setDailyChallengeCompleted(true);
    setDailyChallengeResult({ won, attempts });
    setCanPlayDaily(false);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    let mounted = true;
    
    const safeCheckStatus = async () => {
      if (mounted) {
        await checkDailyChallengeStatus();
      }
    };

    void safeCheckStatus();
    
    return () => {
      mounted = false;
    };
  }, [isClient, checkDailyChallengeStatus]);

  return {
    dailyChallengeCompleted,
    dailyChallengeResult,
    canPlayDaily,
    serverStats,
    isLoadingStats,
    checkDailyChallengeStatus,
    fetchStats,
    resetDailyChallengeStatus,
    updateDailyChallengeResult
  };
};