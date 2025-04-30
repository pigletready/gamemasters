import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Blackjack hooks
export function useBlackjack() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  const blackjackMutation = useMutation({
    mutationFn: async ({ action, bet }: { action: string, bet?: number }) => {
      return await apiRequest("POST", "/api/games/blackjack", { action, bet });
    },
    onSuccess: (res) => {
      // Refresh user data to update balance
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  return {
    balance: user?.balance || 0,
    makeAction: blackjackMutation.mutate,
    isLoading: blackjackMutation.isPending,
    result: blackjackMutation.data,
  };
}

// Slots hooks
export function useSlots() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  const slotsMutation = useMutation({
    mutationFn: async (bet: number) => {
      return await apiRequest("POST", "/api/games/slots", { bet });
    },
    onSuccess: (res) => {
      // Refresh user data to update balance
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  return {
    balance: user?.balance || 0,
    spin: slotsMutation.mutate,
    isLoading: slotsMutation.isPending,
    result: slotsMutation.data,
  };
}

// Roulette hooks
export function useRoulette() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  const rouletteMutation = useMutation({
    mutationFn: async ({ prediction, bet }: { prediction: string, bet: number }) => {
      return await apiRequest("POST", "/api/games/roulette", { prediction, bet });
    },
    onSuccess: (res) => {
      // Refresh user data to update balance
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  return {
    balance: user?.balance || 0,
    placeBet: rouletteMutation.mutate,
    isLoading: rouletteMutation.isPending,
    result: rouletteMutation.data,
  };
}

// Dice hooks
export function useDice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  const diceMutation = useMutation({
    mutationFn: async ({ diceType, prediction, bet }: { diceType: string, prediction: number, bet: number }) => {
      return await apiRequest("POST", "/api/games/dice", { diceType, prediction, bet });
    },
    onSuccess: (res) => {
      // Refresh user data to update balance
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  return {
    balance: user?.balance || 0,
    roll: diceMutation.mutate,
    isLoading: diceMutation.isPending,
    result: diceMutation.data,
  };
}

// Coin flip hooks
export function useCoinFlip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get user data
  const { data: user } = useQuery({
    queryKey: ['/api/me'],
    retry: false,
  });
  
  const coinFlipMutation = useMutation({
    mutationFn: async ({ prediction, bet }: { prediction: string, bet: number }) => {
      return await apiRequest("POST", "/api/games/coinflip", { prediction, bet });
    },
    onSuccess: (res) => {
      // Refresh user data to update balance
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  });
  
  return {
    balance: user?.balance || 0,
    flip: coinFlipMutation.mutate,
    isLoading: coinFlipMutation.isPending,
    result: coinFlipMutation.data,
  };
}
